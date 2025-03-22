// Import modules
const express = require('express');
const fs = require('fs');
const path = require('path');
const { check } = require('express-validator');
const cors = require('cors');
const bodyparser = require('body-parser');
const multer = require('multer');
const stripe = require("stripe")("sk_test_51PyTTVBPFFoOUNzJjLQNya8NZBe6lmtmjUnNa9gY36ZVIt28iu4lYZar86bgditVgulnsdgnwjp9UhhQG3ZOBYec00UJjCLxQF"); // Use environment variable in production
const crypto = require('crypto');
const mongoose = require('mongoose');

// Connect to your database
const connectDB = require("./db"); // Adjust the path if needed
connectDB();

// Import your movieschema model (this file now reuses the model if already compiled)
const Movie = require('./models/Movieschema');

// For other functions (e.g. login, signup, movieProduct, etc.) from your mongoose file
const mongoPractice = require('./mongoose');

// Import screen routes (adjust the path as needed)
const screenRoutes = require('../MongoDB/Routes/screenRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyparser.json());
app.use(express.static('public'));

// Serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Stripe Checkout API
app.post('/api/create-checkout-session', async (req, res) => {
  const { movieName, seatsBooked, totalAmount } = req.body;

  if (typeof totalAmount !== 'number' || totalAmount <= 0) {
    return res.status(400).json({ error: 'Invalid total amount' });
  }

  // Create a line item for each booked seat
  const lineItems = seatsBooked.map(seat => ({
    price_data: {
      currency: 'inr',
      product_data: {
        name: `${movieName} - ${seat.seatType} ${seat.seatNumber}`,
      },
      unit_amount: seat.price * 100,
    },
    quantity: 1,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
      metadata: {
        bookingDetails: JSON.stringify({
          movieName: movieName,
          seatsBooked: seatsBooked,
          totalAmount: totalAmount,
          bookingDate: new Date(),
        }),
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Stripe webhook endpoint to handle Stripe events
app.post('/webhook', bodyparser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // Use environment variable for security

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const bookingDetails = JSON.parse(session.metadata.bookingDetails);

      const screenProduct = new mongoPractice.Projectschema({
        MovieName: bookingDetails.movieName,
        seatsBooked: bookingDetails.seatsBooked,
        totalAmount: bookingDetails.totalAmount,
        bookingDate: bookingDetails.bookingDate,
      });

      await screenProduct.save();
      console.log('Booking data saved successfully');
    } catch (error) {
      console.error('Error processing booking:', error);
    }
  }

  res.json({ received: true });
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// User routes
app.post('/userlogin', mongoPractice.login);
app.post(
  '/userssignup',
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 8 })
  ],
  mongoPractice.signup
);

// Movie routes
app.post('/movieschema/add', 
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'castImage', maxCount: 10 }  // Allow up to 10 cast images
  ]),
  mongoPractice.movieProduct
);
app.get('/movieview', mongoPractice.getMovieProduct);

// UPDATED GET route for movie details
app.get('/getmovieview/:pid', async (req, res, next) => {
  const id = req.params.pid;
  try {
    // Use the imported Movie model
    const product = await Movie.findById(id).exec();
    if (!product) {
      return res.status(404).send('Product not found');
    }
    // Construct the full poster URL. If product.image starts with "http", assume it's a full URL.
    const imageURL = product.image.startsWith("http")
      ? product.image
      : `http://localhost:5000/uploads/${product.image}`;

    res.json({
      movieName: product.movieName,
      movieGenre: product.movieGenre,
      movieLanguage: product.movieLanguage,
      movieDuration: product.movieDuration,
      movieCast: product.movieCast,
      movieDescription: product.movieDescription,
      movieReleasedate: product.movieReleasedate,
      trailerLink: product.trailerLink,
      movieFormat: product.movieFormat,
      imageURL, // Full poster URL
      reviews: product.reviews || []
    });
  } catch (err) {
    next(err);
  }
});

app.patch('/movieview/update/:pid', mongoPractice.updateMovieProductById);
app.delete('/movieview/delete/:pid', mongoPractice.deleteMovieProductById);
app.post('/movieview/review/:pid', mongoPractice.addReviewToMovie);

// Other User routes
app.get('/users', mongoPractice.getUsers);
app.get('/AdmingetUsers', mongoPractice.AdmingetUsers);
app.post('/adminlogin', mongoPractice.adminlogin);
app.post(
  '/adminusers',
  [
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 8 })
  ],
  mongoPractice.adminsignup
);

// Screen routes
app.use('/api/screen', screenRoutes);
app.post('/screen/add', mongoPractice.screen);
app.get('/screen', mongoPractice.getscreen);
app.get('/screen/:pid', mongoPractice.getscreenById);
app.patch('/screen/update/:pid', mongoPractice.updatescreenById);
app.delete('/screen/delete/:pid', mongoPractice.deletescreenById);

// Projectschema routes
app.post('/Projectschema/add', mongoPractice.screenProduct);
app.get('/Projectschema', mongoPractice.getScreenProducts);
app.get('/Projectschema/:pid', mongoPractice.getScreenProductById);
app.get('/Projectschema/user/:userEmail', mongoPractice.getScreenProductsByUserEmail);
app.patch('/Projectschema/update/:pid', mongoPractice.updateScreenProductById);
app.patch('/bookings/:id/cancel', mongoPractice.cancelBooking);
app.delete('/Projectschema/delete/:pid', mongoPractice.deleteScreenProductById);

// Schedule schema routes
app.post('/Scheduleschema/add', mongoPractice.scheduleProduct);
app.get('/scheduleschema', mongoPractice.getscheduleProducts);
app.get('/getScheduleschema/:pid', mongoPractice.getScheduleProductById);
app.get('/Scheduleschema/movie/:pid', mongoPractice.getScheduleProductByMovieName);
app.patch('/Scheduleschema/update/:pid', mongoPractice.updateScheduleProductById);
app.delete('/Scheduleschema/delete/:pid', mongoPractice.deleteScheduleProducById);

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});