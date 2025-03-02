import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Usernavbar from './Usernavbar';
import axios from 'axios';
import Card from './Card';
import Chatbot from './Chatbot';  
import '../Home/UserHome.css';

// Import images for the slider
import slide1 from './Banner.png';
import slide2 from './Endgame.jpg';
import slide3 from './Stree 2.jpg';
import slide4 from './america.jpg';
import slide5 from './Pushpa-2.jpg';

// Import social media icons
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaPinterest, FaLinkedin } from 'react-icons/fa';

const UserHome = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [path] = useState('http://localhost:5000/uploads/');
  const [selectedLanguages, setSelectedLanguages] = useState([]); // For filtering by language

  const images = [slide1, slide2, slide3, slide4, slide5];

  // Fetch movie data from backend on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/movieview');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Save movie details to localStorage for the movie details page, including movieFormat
  const setID = (_id, movieName, movieGenre, movieLanguage, movieFormat) => {
    localStorage.setItem("id", _id);
    localStorage.setItem("moviename", movieName);
    localStorage.setItem("moviegenre", movieGenre);
    localStorage.setItem("movielanguage", movieLanguage);
    localStorage.setItem("movieformat", movieFormat);
  };

  // Toggle language filter
  const toggleLanguage = (lang) => {
    if (lang === "All") {
      setSelectedLanguages([]);
    } else {
      // Set selectedLanguages to only the clicked language
      setSelectedLanguages([lang]);
    }
  };

  // Filter movies based on selected language(s) and search term
  const filteredData = data.filter(item => {
    const movieLanguages = item.movieLanguage.split(/[\/,]/).map(lang => lang.trim().toLowerCase());
    const matchesLanguage =
      selectedLanguages.length === 0 || selectedLanguages.some(selectedLang =>
        movieLanguages.includes(selectedLang.toLowerCase())
      );

    return (
      (item.movieName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.movieGenre.toLowerCase().includes(searchTerm.toLowerCase()) ||
       movieLanguages.some(lang => lang.includes(searchTerm.toLowerCase()))) &&
      matchesLanguage
    );
  });

  // Compute unique languages for the footer section
  const uniqueLanguages = [
    ...new Set(
      data.flatMap(movie =>
        movie.movieLanguage.split(/[\/,]/).map(lang => lang.trim())
      )
    )
  ];

  // Compute unique genres
  const uniqueGenres = [...new Set(data.map(movie => movie.movieGenre))];

  // Compute unique movies (by movieName) for the footer "Movie Now Showing"
  const uniqueMovies = data.reduce((acc, movie) => {
    if (!acc.find(m => m.movieName === movie.movieName)) {
      acc.push(movie);
    }
    return acc;
  }, []);

  return (
    <div className="userhome-container">
      {/* Main Content */}
      <div className="userhome-content">
        <Usernavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {/* Continuous Slider Section */}
        <div className="continuous-slider">
          <div className="slider-track">
            {[...images, ...images].map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`slide-${index}`}
                className="slider-image"
              />
            ))}
          </div>
        </div>

        {/* Language Filter Buttons */}
        <div className="language-section">
          <h2>Movie Languages</h2>
          <div className="language-buttons">
            <button
              className={`language-button ${selectedLanguages.length === 0 ? 'active' : ''}`}
              onClick={() => toggleLanguage("All")}
            >
              All Movies
            </button>
            {["Hindi", "English", "Marathi", "Gujarati", "Tamil", "Telugu", "Bengali"].map((lang) => (
              <button
                key={lang}
                className={`language-button ${selectedLanguages.includes(lang) ? 'active' : ''}`}
                onClick={() => toggleLanguage(lang)}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Movie Posters Section */}
        <div className="movie-posters">
          {filteredData.map((item) => (
            <Link 
              to="/moviedetails" 
              key={item._id} 
              state={{ 
                movieName: item.movieName, 
                userEmail: localStorage.getItem("userEmail") 
              }}
            >
              <Card
                image={`${path}${item.image}`}
                movieName={item.movieName}
                movieGenre={item.movieGenre}
                movieLanguage={item.movieLanguage}
                movieFormat={item.movieFormat} 
                onClick={() => setID(item._id, item.movieName, item.movieGenre, item.movieLanguage, item.movieFormat)}
              />
            </Link>
          ))}
        </div>

        {/* Ad Banner */}
        <div className="ad-banner">
          <div className="ad-content">
            <h1 className="ad-title">TICKETFLIX STREAM</h1>
            <p className="ad-text">Endless Entertainment Anytime. Anywhere!</p>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="footer big-footer">
        <div className="footer-top">
          <div className="footer-section">
            <h4>Movies by Language</h4>
            <ul>
              {uniqueLanguages.map((lang, index) => (
                <li 
                  key={index} 
                  onClick={() => toggleLanguage(lang)}
                  style={{ cursor: 'pointer' }}
                >
                  {lang}
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-section">
            <h4>Movies by Genre</h4>
            <ul>
              {uniqueGenres.map((genre, index) => (
                <li key={index}>{genre}</li>
              ))}
            </ul>
          </div>
          <div className="footer-section">
            <h4>Movie Now Showing</h4>
            <ul>
              {uniqueMovies.map((movie, index) => (
                <li key={index}>
                  <Link 
                    to="/moviedetails" 
                    onClick={() => setID(movie._id, movie.movieName, movie.movieGenre, movie.movieLanguage, movie.movieFormat)}
                    state={{ 
                      movieName: movie.movieName, 
                      userEmail: localStorage.getItem("userEmail") 
                    }}
                  >
                    {movie.movieName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="social-icons">
            <a href="https://www.facebook.com">
              <FaFacebookF />
            </a>
            <a href="https://www.twitter.com">
              <FaTwitter />
            </a>
            <a href="https://www.instagram.com">
              <FaInstagram />
            </a>
            <a href="https://www.youtube.com/@TicketFlix-d6v">
              <FaYoutube />
            </a>
            <a href="https://www.pinterest.com">
              <FaPinterest />
            </a>
            <a href="https://www.linkedin.com">
              <FaLinkedin />
            </a>
          </div>
          <p>&copy; {new Date().getFullYear()} TICKETFLIX. All Rights Reserved.</p>
          <p>The content and images on this site are protected by copyright and remain the property of their respective owners.</p>
        </div>
      </footer>

      {/* Chatbot Component */}
      <Chatbot />
    </div>
  );
};

export default UserHome;
