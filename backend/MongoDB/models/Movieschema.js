// Import the mongoose
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Create the Movie schema
const movie = new mongoose.Schema({
    movieName: { type: String, required: true },
    img: { data: Buffer, contentType: String },
    image: { type: String },
    movieGenre: { type: String, required: true },
    movieLanguage: { type: String, required: true },
    movieDuration: { type: String, required: true },
    movieCast: [{
        name: { type: String, required: true },
        image: { type: String, required: true } // URL or Base64 image
    }],
    movieDescription: { type: String, required: true },
    movieReleasedate: { type: Date, required: true },
    trailerLink: { type: String, required: false }, // Field for YouTube trailer link
    // New field for movie format (e.g., 2D, 3D, IMAX, etc.)
    movieFormat: { type: String, required: true }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

movie.plugin(uniqueValidator);
module.exports = mongoose.model('movieschema', movie);
