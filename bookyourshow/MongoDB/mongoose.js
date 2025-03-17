const mongoose = require('mongoose');
// import the Projectschema from models
const fs=require("fs");
const path=require("path");
const Product = require('./models/Projectschema')
const Product1 = require('./models/Movieschema')
const Product2 = require('./models/Scheduleschema')
const Product3 = require('./models/screen')
const User = require('./models/user')
const Admin = require('./models/Admin')
const { validationResult } = require('express-validator');
const HttpError = require('./models/http-error');
//connect to mongoDB

// Creating get /post/ update/ delete for all the schemas

// mongodb we have to Create the post method to add screen into the mongodb

const screen = async(req, res, next) => {
  const errors = validationResult(req);
if (!errors.isEmpty()) {
  
  const errorMessage='Invalid inputs passed, please check your data.';
  return res.status(422).json({ message: errorMessage });
}
  const screen = new Product3 ({
      ScreenNumber: req.body.ScreenNumber,
      MovieName: req.body.MovieName,
      GoldSeat: req.body.GoldSeat,
      SilverSeat: req.body.SilverSeat,
      PlatinumSeat: req.body.PlatinumSeat
  });
  const result = await screen.save();
  res.json(result);
};

// mongodb we have to Create the get method to add movie product into the mongodb

const getscreen = async(req, res, next) => {

  const product = await Product3.find().exec()

// if product is null
      if (!product){
          res.send('Not Found')
      }
      res.json(product);
  };

// mongodb we have to Create the get method by ID for movie product to get  the product by id

const getscreenById = async (req, res, next) => {
  // get the variable passed by url
  const id = req.params.pid;
  const product = await Product3.findById(id).exec();
  if (!product) {
      res.send('Not Found');
  }
  res.json(product);
};

// mongodb we have to Create the update method to update movie product into the mongodb

const updatescreenById = async(req, res, next)=>{
  const id=req.params.pid;
  const updateData = {
    ScreenNumber: req.body.ScreenNumber,
    MovieName: req.body.MovieName,
    GoldSeat: req.body.GoldSeat,
    SilverSeat: req.body.SilverSeat,
    PlatinumSeat: req.body.PlatinumSeat
  };
  const product = await Product3.findByIdAndUpdate(id, updateData, { new: true });
  if(!product)
  {
      res.send('not found');
  }
  res.json(product);
};

// mongodb we have to Create the delete method to delete the movie product from mongodb

const deletescreenById = async(req,res, next)=>{
  const id = req.params.pid;
 const product = await Product3.findByIdAndDelete(id).exec();
 if (!product){
  res.send('Not Found')
 }
 res.send('Delete successful')
};
// -------------------------------------------------------------------------------------------------------
const movieProduct = async (req, res, next) => {
  const { 
    movieName, 
    movieGenre, 
    movieLanguage, 
    movieDuration, 
    movieCast, 
    movieDescription, 
    movieReleasedate,
    trailerLink,  
    movieFormat  
  } = req.body;

  // Parse movieCast from req.body (assuming it's sent as a JSON array)
  let parsedMovieCast = JSON.parse(movieCast).map(castMember => ({
    name: castMember.name,
    image: castMember.image, // fallback image (if any)
  }));

  console.log("Parsed movie cast:", parsedMovieCast);

  // Ensure cast images are in an array
  if (req.files && req.files.castImage) {
    const castImages = Array.isArray(req.files.castImage)
      ? req.files.castImage
      : [req.files.castImage];
  
    console.log("Uploaded cast images:", castImages);
  
    // Map over parsedMovieCast to assign each cast member a unique image
    parsedMovieCast = parsedMovieCast.map((member, index) => ({
      ...member,
      image: castImages[index] ? castImages[index].filename : member.image,
    }));
  }
  
  console.log("Mapped movie cast:", parsedMovieCast);
  
  const movieProduct = new Product1({
    movieName,
    img: {
      data: fs.readFileSync(path.join(__dirname, '/uploads/', req.files.image[0].filename)),
      contentType: req.files.image[0].mimetype,
    },
    image: req.files.image[0].filename,
    movieGenre,
    movieLanguage,
    movieDuration,
    movieCast: parsedMovieCast,
    movieDescription,
    movieReleasedate,
    trailerLink,    
    movieFormat    
  });

  try {
    const result = await movieProduct.save();
  } catch (err) {
    console.error("Error saving movie product:", err);
    return next(new HttpError('Creating product failed, please try again.', 500));
  }

  return res.status(201).json({ product: movieProduct });
};

// Get all movie products
const getMovieProduct = async (req, res, next) => {
  const product = await Product1.find().exec();

  if (!product) {
    return res.status(404).send('Not Found');
  }
  res.json(product);
};

// Get movie product by ID
const getMovieProductById = async (req, res, next) => {
  const id = req.params.pid;

  try {
    const product = await Product1.findById(id).exec();

    if (!product) {
      return res.status(404).send('Product not found');
    }

    const imageURL = `http://localhost:5000/uploads/${product.image}`;

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
      imageURL,
    });
  } catch (err) {
    next(err);
  }
};

// Update movie product by ID
const updateMovieProductById = async (req, res, next) => {
  const id = req.params.pid;
  const updateData = {
    movieName: req.body.movieName,
    movieGenre: req.body.movieGenre,
    movieLanguage: req.body.movieLanguage,
    movieDuration: req.body.movieDuration,
    movieCast: req.body.movieCast,
    movieDescription: req.body.movieDescription,
    movieReleasedate: req.body.movieReleasedate,
    trailerLink: req.body.trailerLink,
    movieFormat: req.body.movieFormat,
  };
  const product = await Product1.findByIdAndUpdate(id, updateData, { new: true });
  if (!product) {
    return res.status(404).send('Not found');
  }
  res.json(product);
};

// Delete movie product by ID
const deleteMovieProductById = async (req, res, next) => {
  const id = req.params.pid;
  const product = await Product1.findByIdAndDelete(id).exec();
  if (!product) {
    return res.status(404).send('Not Found');
  }
  res.send('Delete successful');
};

// Add a review to a movie product
const addReviewToMovie = async (req, res, next) => {
  const movieId = req.params.pid;
  // Retrieve rating, review, and user (reviewer's name) from the request body
  const { rating, review, user } = req.body;
  // Use the provided user name, or default to "Anonymous" if none is provided
  const reviewer = user && user.trim() !== "" ? user.trim() : "Anonymous";

  try {
    const product = await Product1.findById(movieId);
    if (!product) {
      return res.status(404).json({ message: "Movie not found" });
    }

    if (rating < 0 || rating > 10) {
      return res.status(400).json({ message: "Rating must be between 0 and 10" });
    }

    product.reviews.push({
      user: reviewer,
      rating,
      review,
      createdAt: new Date(),
    });

    await product.save();
    return res.status(201).json({
      message: "Review added successfully",
      reviews: product.reviews,
    });
  } catch (err) {
    console.error("Error adding review:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


//------------------------------------------------------------------------------------------

// mongodb we have to Create the post method to add product into the mongodb
const Projectschema = require('./models/Projectschema'); // Adjust path as needed

// Create a new booking
const screenProduct = async (req, res) => {
  try {
    const { userEmail, movieName, seatsBooked, totalAmount, bookingDate, hall, showTime, status } = req.body;

    console.log('Received data:', { userEmail, movieName, seatsBooked, totalAmount, bookingDate, hall, showTime, status });

    // Validate user email
    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }

    // Check if the user exists
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate incoming data
    if (!movieName || !Array.isArray(seatsBooked) || seatsBooked.length === 0 || typeof totalAmount !== 'number' || !bookingDate) {
      console.log('Validation failed:', { movieName, seatsBooked, totalAmount, bookingDate });
      return res.status(400).json({ error: 'Invalid data format' });
    }

    // Ensure all seat numbers are strings
    if (!seatsBooked.every(seat => typeof seat === 'string')) {
      return res.status(400).json({ error: 'Seats must be an array of seat numbers (strings)' });
    }

    // Convert bookingDate to Date object
    const bookingDateObject = new Date(bookingDate);
    if (isNaN(bookingDateObject.getTime())) {
      console.log('Invalid booking date:', bookingDate);
      return res.status(400).json({ error: 'Invalid booking date' });
    }

    // Validate status field
    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Create a new booking record
    const newBooking = new Projectschema({
      userEmail,
      movieName,
      hall,
      showTime,
      seatsBooked,  // Now just an array of seat numbers
      totalAmount,
      bookingDate: bookingDateObject,
      status: 'confirmed', // Set status to confirmed after successful booking
    });

    // Save to database
    const result = await newBooking.save();
    console.log('Booking saved successfully:', result);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error saving screen product:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Get all bookings
const getScreenProducts = async (req, res) => {
  try {
    const bookings = await Projectschema.find();
    if (!bookings.length) {
      return res.status(404).json({ message: 'No bookings found' });
    }
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get bookings by user email
const getScreenProductsByUserEmail = async (req, res) => {
  try {
    const { userEmail } = req.params;

    const bookings = await Projectschema.find({ userEmail });
    if (!bookings.length) {
      return res.status(404).json({ message: 'No bookings found for this user' });
    }
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get booking by ID
const getScreenProductById = async (req, res) => {
  try {
    const id = req.params.pid;
    const booking = await Projectschema.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update booking by ID
const updateScreenProductById = async (req, res) => {
  try {
    const id = req.params.pid;
    const { userEmail, movieName, seatsBooked, totalAmount, bookingDate, hall, showTime, status } = req.body;

    // Ensure user exists
    if (userEmail) {
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    // Validate status field
    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Ensure seatsBooked is an array of strings
    if (seatsBooked && (!Array.isArray(seatsBooked) || !seatsBooked.every(seat => typeof seat === 'string'))) {
      return res.status(400).json({ error: 'Seats must be an array of seat numbers (strings)' });
    }

    const updateData = {
      userEmail,
      movieName,
      hall,
      showTime,
      seatsBooked,
      totalAmount,
      bookingDate,
      status, // Allow updating status
    };

    const booking = await Projectschema.findByIdAndUpdate(id, updateData, { new: true });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    // Update only the status field to 'cancelled'
    const updatedBooking = await Projectschema.findByIdAndUpdate(
      bookingId,
      { status: 'cancelled' },
      { new: true }
    );
    
    if (!updatedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ message: 'Booking cancelled successfully', booking: updatedBooking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Delete booking by ID
const deleteScreenProductById = async (req, res) => {
  try {
    const id = req.params.pid;
    const booking = await Projectschema.findByIdAndDelete(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------------------------------------

// mongodb we have to Create the post method to add movie schedule into the mongodb

const scheduleProduct = async (req, res, next) => {
  try {
    const scheduleProduct = new Product2({
      MovieName: req.body.MovieName,
      hallName: req.body.hallName,   // hallName as an array
      showTime: req.body.showTime    // showTime as an array of objects (each with time and ticket prices)
    });

    const result = await scheduleProduct.save();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Creating schedule failed' });
  }
};

// Get all schedule products
const getscheduleProducts = async (req, res, next) => {
  try {
    const products = await Product2.find().exec();
    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No schedules found' });
    }
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fetching schedules failed' });
  }
};

// Get a single schedule product by ID
const getScheduleProductById = async (req, res, next) => {
  const id = req.params.pid;
  try {
    const product = await Product2.findById(id).exec();
    if (!product) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fetching schedule failed' });
  }
};

// Get a schedule product by MovieName
const getScheduleProductByMovieName = async (req, res, next) => {
  const movieName = req.params.pid;
  try {
    const product = await Product2.findOne({ MovieName: { $regex: new RegExp(movieName, 'i') } }).exec();
    if (!product) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fetching schedule failed' });
  }
};

// Update a schedule product by ID
const updateScheduleProductById = async (req, res, next) => {
  const id = req.params.pid;
  const updateData = {
    MovieName: req.body.MovieName,
    hallName: req.body.hallName,   // hallName as an array
    showTime: req.body.showTime    // showTime as an array of objects (each with time and ticket prices)
  };

  try {
    const product = await Product2.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!product) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Updating schedule failed' });
  }
};

// Delete a schedule product by ID
const deleteScheduleProducById = async (req, res, next) => {
  const id = req.params.pid;
  try {
    const product = await Product2.findByIdAndDelete(id).exec();
    if (!product) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Deleting schedule failed' });
  }
};
 //-------------------------------------------------------------------------------------------------------------------------------------
 
 const getUsers = async (req, res) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    
      const errorMessage='Fetching users failed, please try again later.';
      return res.status(500).json({ message: errorMessage });
  

  }
  res.json({users: users.map(user => user.toObject({ getters: true }))});
};

// ------------------------------------------------------------------------------------------------

const AdmingetUsers = async (req, res) => {
  let users;
  try {
    users = await Admin.find({}, '-password');
  } catch (err) {
    
      const errorMessage='Fetching users failed, please try again later.';
      return res.status(500).json({ message: errorMessage });
  

  }
  res.json({users: users.map(Admin => Admin.toObject({ getters: true }))});
};
// ------------------------------------------------------------------------------------------
 const adminsignup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      
      const errorMessage='Invalid inputs passed, please check your data.';
      return res.status(422).json({ message: errorMessage });
    }
    const { name, email, password ,usertype} = req.body;
  
    let existingUser
    try {
      existingUser = await User.findOne({ email: email })
    } catch (err) {
      
      return res.status(500).json({ message: 'Signing up failed, please try again later.' });
    }
    
    if (existingUser) {
      
      const errorMessage='User exists already, please login instead.';
      return res.status(422).json({ message: errorMessage });
    }
    //let hashPassword;
    //hashPassword=await bycryptjs.hash(password,12);
    const createdUser = new Admin({
      name,
      email,
      password,
      usertype
    });
  
    try {
      await createdUser.save();
    } catch (err) {
      
      const errorMessage='Signing up failed, please try again.';
      return res.status(422).json({ message: errorMessage });
    }
  
   return res.status(201).json({user: createdUser.toObject({ getters: true })});
  };
  const signup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      
      const errorMessage='Invalid inputs passed, please check your data.';
      return res.status(422).json({ message: errorMessage });
    }
    const { name, email, password, usertype } = req.body;
  
    let existingUser
    try {
      existingUser = await User.findOne({ email: email })
    } catch (err) {
      
      return res.status(500).json({ message: 'Signing up failed, please try again later.' });
    }
    
    if (existingUser) {
      
      const errorMessage='User exists already, please login instead.';
      return res.status(422).json({ message: errorMessage });
    }
    //let hashPassword;
    //hashPassword=await bycryptjs.hash(password,12);
    const createdUser = new User({
      name,
      email,
      //password:hashPassword,
      password,
      usertype
    });
  
    try {
      await createdUser.save();
    } catch (err) {
      
      const errorMessage='Signing up failed, please try again.';
      return res.status(422).json({ message: errorMessage });
    }
  
    return res.status(201).json({user: createdUser.toObject({ getters: true })});
  };
  
  const login = async (req, res) => {
    const { email, password } = req.body;
  
    let existingUser;
  
    try {
      existingUser = await User.findOne({ email: email });
    } catch (err) {
      const errorMessage = 'Logging in failed, please try again later.';
      return res.status(500).json({ message: errorMessage });
    }
  
    // Ensure there's no usertype === 'admin' check for regular user login
    if (!existingUser || existingUser.password !== password) {
      const errorMessage = 'Invalid username or password, could not log you in.';
      return res.status(401).json({ message: errorMessage });
    }
  
    return res.status(201).json({ user: existingUser.toObject({ getters: true }) });
  };
  
  
 const adminlogin = async (req, res) => {
    //console.log("fired"+email);
    const { email, password } = req.body;
  
    let existingAdmin;
  
    try {
      existingAdmin = await Admin.findOne({ email: email })
    } catch (err) {
      const errorMessage='Logging in failed, please try again later.';
      return res.status(500).json({ message: errorMessage });
    };
    
    if (!existingAdmin || existingAdmin.password !== password ||existingAdmin.usertype !=="Admin") {
      const errorMessage='Invalid User name & password, could not log you in.';
   
      return res.status(401).json({ message: errorMessage });
    }
  
    return res.status(200).json({ Admin: existingAdmin.toObject({ getters: true }) });
  };
exports.getUsers = getUsers;
exports.AdmingetUsers = AdmingetUsers
exports.adminsignup = adminsignup;
exports.signup = signup;
exports.adminlogin = adminlogin;
exports.login = login;

//export one by one product
// Exporting all post, get, update, delete method for screen product

exports.screen = screen;
exports.getscreen = getscreen;
exports.getscreenById = getscreenById;
exports.updatescreenById = updatescreenById;
exports.deletescreenById = deletescreenById;

//export one by one product
// Exporting all post, get, update, delete method for moview product

exports.movieProduct = movieProduct;
exports.getMovieProduct = getMovieProduct;
exports.getMovieProductById = getMovieProductById;
exports.updateMovieProductById = updateMovieProductById;
exports.deleteMovieProductById = deleteMovieProductById;
exports.addReviewToMovie = addReviewToMovie;

// Exporting all post, get, update, delete method for screen product

exports.screenProduct = screenProduct;
exports.getScreenProducts = getScreenProducts;
exports.getScreenProductById = getScreenProductById;
exports.getScreenProductsByUserEmail = getScreenProductsByUserEmail;
exports.updateScreenProductById=updateScreenProductById;
exports.cancelBooking = cancelBooking;
exports.deleteScreenProductById = deleteScreenProductById;

// Exporting all post, get, update, delete method for schedule product

exports.scheduleProduct = scheduleProduct;
exports.getscheduleProducts = getscheduleProducts;
exports.getScheduleProductById = getScheduleProductById;
exports.updateScheduleProductById = updateScheduleProductById;
exports.getScheduleProductByMovieName = getScheduleProductByMovieName;
exports.deleteScheduleProducById = deleteScheduleProducById;