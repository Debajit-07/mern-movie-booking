import React, { useEffect, useState } from "react";
import { useNavigate,} from "react-router-dom";
import axios from "axios";
import "../Home/Moviedetails.css"; // Ensure this path is correct
import Usernavbar from "./Usernavbar";
import { FaFilm } from "react-icons/fa"; 
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaPinterest,
  FaLinkedin,
} from "react-icons/fa";

function Moviedetails() {
  // States for movie details
  const [movieImage, setMovieImage] = useState("");
  const [movieName, setMovieName] = useState("");
  const [movieGenre, setMovieGenre] = useState("");
  const [movieLanguage, setMovieLanguage] = useState("");
  const [movieFormat, setMovieFormat] = useState("");
  const [movieDuration, setMovieDuration] = useState("");
  const [movieDescription, setMovieDescription] = useState("");
  const [movieCast, setMovieCast] = useState([]);
  const [trailerLink, setTrailerLink] = useState("");
  const [id, setId] = useState("");

  // Popup state for language selection
  const [showLanguagePopup, setShowLanguagePopup] = useState(false);

  // States for footer dynamic content
  const [uniqueLanguages, setUniqueLanguages] = useState([]);
  const [uniqueGenres, setUniqueGenres] = useState([]);
  const [uniqueMovies, setUniqueMovies] = useState([]);

  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch the movie details by ID
  const fetchData = async (movieId) => {
    try {
      const response = await axios.get(`http://localhost:5000/getmovieview/${movieId}`);
      console.log("API Response:", response.data);
      const {
        movieName,
        movieGenre,
        movieLanguage,
        movieFormat,
        movieDuration,
        movieDescription,
        imageURL,
        movieCast,
        trailerLink,
      } = response.data;
      setMovieImage(imageURL);
      setMovieName(movieName);
      setMovieGenre(movieGenre);
      setMovieLanguage(movieLanguage);
      setMovieFormat(movieFormat);
      setMovieDuration(movieDuration);
      setMovieDescription(movieDescription);
      setMovieCast(movieCast || []);
      setTrailerLink(trailerLink || "");
    } catch (error) {
      console.error("Error fetching movie data:", error);
    }
  };

  // On component mount, get the movie ID from localStorage
  useEffect(() => {
    const movieId = localStorage.getItem("id");
    if (!movieId) {
      navigate("/");
      return;
    }
    setId(movieId);
    fetchData(movieId);
  }, [navigate]);

  // Navigate to the trailer page (multimedia) when poster is clicked
  const handlePosterClick = () => {
    navigate("/multimedia", { state: { trailerLink, movieName } });
  };

  // Show the language popup instead of navigating immediately
  const handleClick = () => {
    setShowLanguagePopup(true);
  };

  // Called when user selects a language in the popup
  const handleLanguageSelect = (chosenLanguage) => {
    const storedEmail = localStorage.getItem("userEmail") || "";
    // Pass chosenLanguage to MovieShowtime if you like
    navigate("/movieShowtime", {
      state: {
        movieName,
        userEmail: storedEmail,
        chosenLanguage: chosenLanguage, // if you want to store the chosen language
      },
    });
    setShowLanguagePopup(false);
  };

  // Close the language popup
  const closeLanguagePopup = () => {
    setShowLanguagePopup(false);
  };

  // Fetch dynamic data for the footer (languages, genres, movies)
  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/movieview");
        const data = response.data;

        // Compute unique languages
        const languages = [
          ...new Set(
            data.flatMap((movie) =>
              movie.movieLanguage.split(/[\/,]/).map((lang) => lang.trim())
            )
          ),
        ];
        setUniqueLanguages(languages);

        // Compute unique genres
        const genres = [...new Set(data.map((movie) => movie.movieGenre))];
        setUniqueGenres(genres);

        // Compute unique movies (by movieName)
        const unique = data.reduce((acc, movie) => {
          if (!acc.find((m) => m.movieName === movie.movieName)) {
            acc.push(movie);
          }
          return acc;
        }, []);
        setUniqueMovies(unique);
      } catch (error) {
        console.error("Error fetching footer data:", error);
      }
    };

    fetchFooterData();
  }, []);

  // (CHANGED) Convert the movieLanguage field into an array of languages
  const splittedLangs = movieLanguage
    ? movieLanguage.split(/[\/,]/).map((lang) => lang.trim())
    : [];

  return (
    <>
      <Usernavbar />

      {/* Movie Details Section */}
      <div className="moviedetails-container">
      {movieImage && (
        <div className="detail-item-1 poster-container">
          <img src={movieImage} alt={movieName} className="movie-image" />
        </div>
      )}

      <div className="detail-item-2">
        <h1>{movieName}</h1>
        <div className="movie-stats">
          <span>{movieLanguage}</span>
          <span>{movieGenre}</span>
          <span>{movieFormat}</span>
          <span>{movieDuration}</span>
        </div>

        {/* Trailer Button Above Book Ticket Button */}
        <div className="trailer-button-container">
        <button onClick={handlePosterClick} className="trailer-button">
          <FaFilm className="trailer-icon" /> Watch Trailer</button>

        </div>

        <div className="booking-button-container">
          <button onClick={handleClick} className="booking-button"> Book Tickets</button>
        </div>
      </div>
    </div>

      {/* Movie Description */}
      <div className="movie-description">
        <h2>About the movie</h2>
        <p>{movieDescription}</p>
      </div>

      {/* Movie Cast */}
      <div className="movie-cast">
        <h2>Cast</h2>
        <ul>
          {movieCast.length > 0 ? (
            movieCast.map((actor, index) => (
              <li key={index}>
                <div className="cast-member">
                  <img
                    src={`http://localhost:5000/uploads/${actor.image}`}
                    alt={actor.name}
                    className="cast-image"
                  />
                  <p>{actor.name}</p>
                </div>
              </li>
            ))
          ) : (
            <p>No cast information available.</p>
          )}
        </ul>
      </div>


      {/* Language Popup */}
      {showLanguagePopup && (
        <div className="popup-language-booking">
          <div className="popup-language-booking-content">
            <span className="popup-language-close" onClick={closeLanguagePopup}>
              &times;
            </span>
            <h2>Select Language</h2>
            <div style={{ marginTop: "1rem" }}>
              {/* (CHANGED) Dynamically list languages from movieLanguage */}
              {splittedLangs.map((lang, index) => (
                <button
                  key={index}
                  className="popup-language-button"
                  onClick={() => handleLanguageSelect(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Moviedetails;
