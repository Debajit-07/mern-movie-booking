import React, { useState, useEffect } from "react";
import Navbar from "../Admin/Navbar";
import axios from "axios";
import "../Admin/Movieview.css";
import { Link } from "react-router-dom";

const Movieview = () => {
  const [data, setData] = useState([]);
  // Remove local path as we're now using full URLs for images
  // const [path] = useState("http://localhost:5000/uploads/");
  const [showPopup, setShowPopup] = useState(false); // Initially false

  const fetchData = async () => {
    try {
      // Clear localStorage keys related to movie details
      localStorage.setItem("id", "");
      localStorage.setItem("Movie Name", "");
      localStorage.setItem("movie Genre", "");
      localStorage.setItem("movie Language", "");
      localStorage.setItem("movie Duration", "");
      localStorage.setItem("movie Cast", "");
      localStorage.setItem("movie Description", "");
      localStorage.setItem("movie Releasedate", "");
      localStorage.setItem("movie Trailer", "");
      localStorage.setItem("movie Format", "");
      localStorage.setItem("moviereviews", ""); // Clear existing reviews if any

      // Fetch movies from backend
      const response = await axios.get("http://localhost:5000/movieview");
      setData(response.data);
      console.log("Fetched movies:", response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();

    // Check if the pop-up has been shown before
    const isPopupShown = localStorage.getItem("isPopupShown");

    if (!isPopupShown) {
      // Show the pop-up if not shown before
      setShowPopup(true);

      // Hide the pop-up after 3 seconds
      const timer = setTimeout(() => {
        setShowPopup(false);

        // Set a flag in localStorage to prevent future pop-ups
        localStorage.setItem("isPopupShown", "true");
      }, 3000);

      // Clear the timer on component unmount
      return () => clearTimeout(timer);
    }
  }, []);

  /**
   * Store movie details (including reviews) in localStorage
   * so the details page can retrieve them.
   */
  function setID(
    _id,
    movieName,
    movieGenre,
    movieLanguage,
    movieDuration,
    movieCast,
    movieDescription,
    movieReleasedate,
    trailerLink,
    movieFormat,
    reviews
  ) {
    console.log("Selected movie ID:", _id);
    localStorage.setItem("id", _id);
    localStorage.setItem("moviename", movieName);
    localStorage.setItem("moviegenre", movieGenre);
    localStorage.setItem("movielanguage", movieLanguage);
    localStorage.setItem("movieduration", movieDuration);
    localStorage.setItem("moviecast", JSON.stringify(movieCast));
    localStorage.setItem("moviedescription", movieDescription);
    localStorage.setItem("moviereleasedate", movieReleasedate);
    localStorage.setItem("movietrailer", trailerLink);
    localStorage.setItem("movieformat", movieFormat);
    // Store reviews as a JSON string
    localStorage.setItem("moviereviews", JSON.stringify(reviews));
  }

  async function deleted(id) {
    try {
      const response = await axios.delete(`http://localhost:5000/movieview/delete/${id}`);
      console.log("Delete response:", response);
    } catch (err) {
      console.error("Error deleting movie:", err);
    }
    fetchData();
  }

  return (
    <div className="movieview">
      <Navbar />

      {/* Pop-up Modal */}
      {showPopup && (
        <div className="popup-container">
          <div className="popup">
            <h2>Welcome back, Admin!</h2>
            <button onClick={() => setShowPopup(false)} className="close-popup-btn">
              Close
            </button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="table1">
          <thead>
            <tr>
              <th>Movie Poster</th>
              <th>Movie Name</th>
              <th>Movie Genre</th>
              <th>Movie Language</th>
              <th>Movie Duration</th>
              <th>Movie Cast</th>
              <th>Movie Description</th>
              <th>Movie Releasedate</th>
              <th>Movie Trailer</th>
              <th>Movie Format</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id}>
                <td>
                  <img
                    className="table-imagesize"
                    // Now use the full URL stored in item.image
                    src={item.image}
                    alt={item.movieName}
                  />
                </td>
                <td>{item.movieName}</td>
                <td>{item.movieGenre}</td>
                <td>{item.movieLanguage}</td>
                <td>{item.movieDuration}</td>
                <td>
                  {item.movieCast &&
                    item.movieCast.map((cast, index) => (
                      <div key={index} className="cast-container-admin">
                        <img
                          className="cast-image-admin"
                          // Use the cast image URL directly
                          src={cast.image}
                          alt={cast.name}
                        />
                        <div>{cast.name}</div>
                      </div>
                    ))}
                </td>
                <td>{item.movieDescription}</td>
                <td>{item.movieReleasedate}</td>
                <td>{item.trailerLink}</td>
                <td>{item.movieFormat}</td>
                <td>
                  <Link to="/editmovie">
                    <button
                      className="update"
                      onClick={() =>
                        setID(
                          item._id,
                          item.movieName,
                          item.movieGenre,
                          item.movieLanguage,
                          item.movieDuration,
                          item.movieCast,
                          item.movieDescription,
                          item.movieReleasedate,
                          item.trailerLink,
                          item.movieFormat,
                          item.reviews // pass reviews as well
                        )
                      }
                    >
                      Update
                    </button>
                  </Link>
                </td>
                <td>
                  <button className="delete" onClick={() => deleted(item._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="Add_button_container">
        <Link to="/movie" style={{ textDecoration: "none" }}>
          <button className="Addbutton">Add Movie</button>
        </Link>
      </div>
    </div>
  );
};

export default Movieview;