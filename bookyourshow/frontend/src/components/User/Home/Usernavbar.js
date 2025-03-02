import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../Home/Usernavbar.css'; // Make sure this path is correct

const Usernavbar = ({ searchTerm, setSearchTerm }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const [username, setUsername] = useState(''); // State for username
  const [showPopup, setShowPopup] = useState(false); // New state for popup message
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear local storage and update login status
    localStorage.clear();
    setIsLoggedIn(false);
    navigate('/');
  };

  useEffect(() => {
    // Check if the user is logged in
    const userType = localStorage.getItem("usertype");
    if (userType === 'user') {
      setIsLoggedIn(true);
      // Retrieve and parse the stored user data
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          setUsername(userObj.name); // Assumes the user object has a "name" property
        } catch (err) {
          console.error('Error parsing user data from localStorage:', err);
        }
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const gotoadmin = () => {
    navigate('/login');
  };

  const goToHome = () => {
    navigate('/');
  };

  return (
    <>
      <div className="User-Navbar">
        <div className="navbar-logo" onClick={goToHome} style={{ cursor: 'pointer' }}>
          <img src={require('./logo-png.png')} alt="TicketFlix Logo" className="logo-img" />
        </div>

        <div className="navbar-left">
          {/* Always show My Bookings link; if not logged in, show popup instead of navigating */}
          <NavLink
            className="user-nav"
            to="/mybooking"
            onClick={(e) => {
              if (!isLoggedIn) {
                e.preventDefault();
                setShowPopup(true);
              }
            }}
          >
            My Bookings
          </NavLink>
        </div>

        <div className="navbar-center">
          <div className="search-bar-container">
            <div className="search-logo">
              <img src={require('./search.png')} alt="Search" className="search-icon" />
            </div>
            <input
              type="text"
              placeholder="Search for movies by name, genre, or language..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-bar"
            />
          </div>
        </div>

        <div className="navbar-right">
          {/* Display username if logged in */}
          {isLoggedIn && (
            <div className="user-info">
              <span>Welcome {username.split(" ")[0]}</span>
            </div>
          )}

          {/* Hamburger Menu Wrapper */}
          <div className="hamburger-wrapper">
            <div className={`hamburger-menu ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>

            <div className={`hamburger-dropdown ${isOpen ? 'open' : ''}`}>
              <ul>
                <li>
                  <NavLink
                    className="user-nav"
                    to="/login"
                    onClick={() => {
                      gotoadmin();
                      closeMenu();
                    }}
                  >
                    AdminLogin
                  </NavLink>
                </li>
                <li>
                  <NavLink className="user-nav" to="/Aboutus" onClick={closeMenu}>
                    About Us
                  </NavLink>
                </li>
                <li>
                  <NavLink className="user-nav" to="/support" onClick={closeMenu}>
                    Help & Support
                  </NavLink>
                </li>
                <li>
                  <button
                    type="button"
                    className="trylog-button"
                    onClick={isLoggedIn ? handleLogout : () => navigate('/trylogin')}
                  >
                    <span>{isLoggedIn ? 'Logout' : 'Login'}</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Modal for prompting login when accessing My Bookings */}
      {showPopup && (
        <div className="popup-overlay-Booking">
          <div className="popup-Booking">
            <p className="popup-message-Booking">Please log in to view your bookings.</p>
            <div className="popup-buttons-Booking">
              <button
                className="popup-button-Booking"
                onClick={() => {
                  setShowPopup(false);
                  navigate('/trylogin');
                }}
              >
                <span className="button_top">Login</span>
              </button>
              <button
                className="popup-cancel-button-Booking"
                onClick={() => setShowPopup(false)}
              >
                <span className="button_top">Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Usernavbar;