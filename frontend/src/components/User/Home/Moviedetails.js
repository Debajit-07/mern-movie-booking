import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Home/Moviedetails.css"; // Ensure the path is correct
import Usernavbar from "./Usernavbar";
import { FaFilm } from "react-icons/fa";
import { FaStar } from "react-icons/fa";

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

  // Reviews state (per movie)
  const [reviews, setReviews] = useState([]);

  // Popup state for language selection
  const [showLanguagePopup, setShowLanguagePopup] = useState(false);

  // State for review modal and review form fields
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewRating, setReviewRating] = useState("");
  const [reviewText, setReviewText] = useState("");

  const navigate = useNavigate();
  const reviewsSliderRef = useRef(null);
  // "right" = arrow on right side (default), "left" = arrow on left side
  const [arrowPosition, setArrowPosition] = useState("right");

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /**
   * Fetch movie details and reviews from the server.
   * If reviews are empty, fall back to the reviews saved in localStorage
   * using a key that is specific to the movie.
   */
  const fetchData = async (movieId) => {
    const localKey = "moviereviews_" + movieId;
    try {
      const response = await axios.get(`http://localhost:5000/getmovieview/${movieId}`);
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
        reviews: fetchedReviews,
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

      if (fetchedReviews && fetchedReviews.length > 0) {
        setReviews(fetchedReviews);
        localStorage.setItem(localKey, JSON.stringify(fetchedReviews));
      } else {
        const storedReviews = localStorage.getItem(localKey);
        if (storedReviews) {
          setReviews(JSON.parse(storedReviews));
        } else {
          setReviews([]);
        }
      }
    } catch (error) {
      console.error("Error fetching movie data:", error);
      const storedReviews = localStorage.getItem(localKey);
      if (storedReviews) {
        setReviews(JSON.parse(storedReviews));
      }
    }
  };

  // On component mount, get movie ID from localStorage then fetch details.
  useEffect(() => {
    const movieId = localStorage.getItem("id");
    if (!movieId) {
      navigate("/");
      return;
    }
    setId(movieId);
    fetchData(movieId);
  }, [navigate]);

  // Navigate to the trailer page when poster is clicked
  const handlePosterClick = () => {
    navigate("/multimedia", { state: { trailerLink, movieName } });
  };

  // Show language popup
  const handleClick = () => {
    setShowLanguagePopup(true);
  };

  // Called when user selects a language
  const handleLanguageSelect = (chosenLanguage) => {
    const storedEmail = localStorage.getItem("userEmail") || "";
    navigate("/movieShowtime", {
      state: {
        movieName,
        userEmail: storedEmail,
        chosenLanguage,
      },
    });
    setShowLanguagePopup(false);
  };

  // Close language popup
  const closeLanguagePopup = () => {
    setShowLanguagePopup(false);
  };

  // Convert movieLanguage to an array of languages (if needed)
  const splittedLangs = movieLanguage
    ? movieLanguage.split(/[\/,]/).map((lang) => lang.trim())
    : [];

  /* 
     SINGLE ARROW SLIDER LOGIC:
     - on scroll, if at left edge, arrow shows on right ("right").
     - if at right edge, arrow shows on left ("left").
     - otherwise, default to "right".
  */
  const handleScroll = () => {
    if (!reviewsSliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = reviewsSliderRef.current;

    if (scrollLeft <= 10) {
      setArrowPosition("right");
    } else if (scrollLeft + clientWidth >= scrollWidth - 10) {
      setArrowPosition("left");
    } else {
      setArrowPosition("right");
    }
  };

  const handleArrowClick = () => {
    if (!reviewsSliderRef.current) return;
    const { scrollWidth, clientWidth } = reviewsSliderRef.current;
    if (arrowPosition === "right") {
      // Scroll to far right
      reviewsSliderRef.current.scrollLeft = scrollWidth;
    } else {
      // Scroll to far left
      reviewsSliderRef.current.scrollLeft = 0;
    }
  };

  // Handler to open review modal
  const openReviewModal = () => {
    setShowReviewModal(true);
  };

  // Handler to close review modal
  const closeReviewModal = () => {
    setShowReviewModal(false);
  };

  // Handle review submission from the modal
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!reviewRating) {
      alert("Please select a rating.");
      return;
    }

    try {
      // POST the review to the server
      const response = await axios.post(
        `http://localhost:5000/movieview/review/${id}`,
        {
          rating: parseInt(reviewRating, 10),
          review: reviewText,
          user: reviewerName.trim() || "Anonymous",
        }
      );

      // Update local storage and reviews state
      const localKey = "moviereviews_" + id;
      localStorage.setItem(localKey, JSON.stringify(response.data.reviews));
      setReviews(response.data.reviews);

      // Clear the form fields
      setReviewerName("");
      setReviewRating("");
      setReviewText("");

      // Close the modal
      closeReviewModal();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review. Please try again.");
    }
  };

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
          {/* Trailer Button */}
          <div className="trailer-button-container">
            <button onClick={handlePosterClick} className="trailer-button">
              <FaFilm className="trailer-icon" /> Watch Trailer
            </button>
          </div>
          {/* Book Tickets Button */}
          <div className="booking-button-container">
            <button onClick={handleClick} className="booking-button">
              Book Tickets
            </button>
          </div>
        </div>
      </div>

      {/* Movie Description */}
      <div className="Movie-description">
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

      {/* Movie Reviews (Horizontal Slider with Single Arrow) */}
      <div className="movie-reviews">
        <h2>Reviews</h2>
        {reviews.length > 0 ? (
          <div className="reviews-slider-container">
            <button className={`slider-arrow ${arrowPosition}`} onClick={handleArrowClick}>
              {arrowPosition === "right" ? ">" : "<"}
            </button>
            <div className="reviews-slider" ref={reviewsSliderRef} onScroll={handleScroll}>
              <ul>
                {reviews.map((item, index) => (
                  <li key={index}>
                    <div className="review-item">
                      <p>
                        <strong>{item.user || "Anonymous"}</strong> rated it⭐ {item.rating} / 5
                      </p>
                      {item.review && <p>{item.review}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p>No reviews available.</p>
        )}
      </div>

      {/* Submit Review Button */}
      <div className="submit-review-container">
        <button onClick={openReviewModal} className="submit-review-button">
          Submit Your Review
        </button>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal-overlay-review">
          <div className="modal-content-review">
            <span className="modal-close-review" onClick={closeReviewModal}>
              &times;
            </span>
            <h2>Submit Your Review</h2>
            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label htmlFor="reviewerName">Your Name</label>
                <input
                  id="reviewerName"
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div className="custom-rating-container">
  <FaStar className="rating-star-icon" />
  <div className="slider-wrapper">
    <input
      type="range"
      min="0"
      max="10"
      step="1"
      value={reviewRating}
      onChange={(e) => setReviewRating(e.target.value)}
      className="rating-slider"
    />
    <span className="slider-label">SLIDE TO RATE &rarr;</span>
  </div>
  <span className="rating-value">{reviewRating}/10</span>
</div>
              <div className="form-group">
                <label htmlFor="review">Review</label>
                <textarea
                  id="review"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows="4"
                  placeholder="Share your thoughts about the movie"
                />
              </div>
              <button type="submit" className="submit-button">
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Language Popup */}
      {showLanguagePopup && (
        <div className="popup-language-booking">
          <div className="popup-language-booking-content">
            <span className="popup-language-close" onClick={closeLanguagePopup}>
              &times;
            </span>
            <h2>Select Language</h2>
            <div style={{ marginTop: "1rem" }}>
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
