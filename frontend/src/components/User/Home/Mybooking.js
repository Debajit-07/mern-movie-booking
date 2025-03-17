import React, { useState, useEffect } from "react"; 
import axios from "axios";
import "../Home/Mybookings.css";
import Usernavbar from "./Usernavbar";
import { QRCodeCanvas } from "qrcode.react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

const MyBooking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showThankYou, setShowThankYou] = useState(true);

  dayjs.extend(utc);
  dayjs.extend(timezone);

  // Get the logged-in user's email from localStorage
  const userEmail = localStorage.getItem("userEmail") || "";
  console.log("Logged in user's email:", userEmail);

  // Helper function to format time
  const formatTime = (timeStr) => {
    if (!timeStr || !timeStr.includes(":")) return timeStr;
    const [hourStr, minuteStr] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minuteStr} ${ampm}`;
  };

  // Fetch bookings from backend
  const fetchBookings = async () => {
    try {
      const response = await axios.get("http://localhost:5000/Projectschema");
      console.log("Fetched bookings:", response.data);
      setBookings(response.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to load booking data");
    }
  };

  // Fetch movies from backend
  const fetchMovies = async () => {
    try {
      const response = await axios.get("http://localhost:5000/movieview");
      setMovies(response.data || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchBookings();
      await fetchMovies();
      setLoading(false);
    };
    fetchData();

    // Show "Thank you" message for 5 seconds
    const timer = setTimeout(() => setShowThankYou(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/bookings/${id}/cancel`);
      fetchBookings();
      closeModal();
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  const openModal = (bookingId) => {
    setSelectedBooking(bookingId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Ensure bookings is an array before filtering
  const filteredBookings = Array.isArray(bookings)
    ? bookings.filter((booking) => {
        const bookingEmail = booking.userEmail?.trim().toLowerCase() || "";
        const storedEmail = userEmail.trim().toLowerCase();
        return bookingEmail === storedEmail;
      })
    : [];

  return (
    <div className="my-bookings">
      <Usernavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {showThankYou && (
        <div className="thank-you-message_booking">
          <p>Thank you for your purchase! Your booking is complete.</p>
        </div>
      )}

      {filteredBookings.length > 0 ? (
        filteredBookings.map((booking) => {
          // Find movie details for the booking
          const movie = movies.find((m) => m.movieName === booking.movieName);

          return (
            <div className="card_booking" key={booking._id}>
              <div className="card-content_booking">
                <div className="left-container">
                  <h3>{booking.movieName}</h3>

                  {/* Movie Image */}
                  <div className="movie-image">
                       {movie && movie.image ? (
                      <img
                        src={`http://localhost:5000/uploads/${movie.image}`}
                        alt={booking.movieName}
                        className="movie-poster"
                      />
                    ) : (
                      <p>Loading poster...</p>
                    )}
                  </div>

                  {/* Hall & Show Time */}
                  <div className="hall-showtime-booking">
                    {booking.hall && <p>Hall: {booking.hall}</p>}
                    {booking.showTime && (
                      <p>Show Time: {formatTime(booking.showTime)}</p>
                    )}
                  </div>
                </div>

                <div className="middle-container">
                  {/* Seats Booked - Ensure it's an array before mapping */}
                  <div className="seats-booked_booking">
                    <h4 className="seat-h4">Seats Booked:</h4>
                    {Array.isArray(booking.seatsBooked) && booking.seatsBooked.length > 0 ? (
                    <p>Seat Number: {booking.seatsBooked.join(", ")}</p> // Display seats as a comma-separated string
                    ) : (
                    <p>No seats booked.</p>
                    )}
                  </div>


                  {/* Booking Status */}
                  <h1
                    className={
                      booking.status?.trim().toLowerCase() === "cancelled"
                        ? "cancelled-ticket"
                        : "active-ticket"
                    }
                  >
                    Status: {booking.status}
                  </h1>

                  <p>Total Amount: ₹{booking.totalAmount}</p>
                  <p>Booking Date: {dayjs
                    .utc(booking.bookingDate)
                    .local()
                    .format("MM/DD/YYYY")}
                  </p>
                </div>

                {/* QR Code */}
                <div className="right-container">
                  <div className="qr-code">
                    <QRCodeCanvas value={JSON.stringify(booking)} size={128} />
                  </div>
                </div>

                {/* Cancel Button */}
                {booking.status?.trim().toLowerCase() !== "cancelled" && (
                  <button
                    className="delete-btn_booking"
                    onClick={() => openModal(booking._id)}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="nobooking">
          <img
            src={require("./norecord.png")}
            alt="no-booking"
            className="nobooking"
          />
          <p>No bookings found.</p>
        </div>
      )}

      {showModal && (
        <div className="cancel-popup">
          <p>Are you sure you want to cancel this booking?</p>
          <div>
            <button
              className="confirm-btn_booking"
              onClick={() => handleDelete(selectedBooking)}
            >
              Yes
            </button>
            <button className="cancel-btn_booking" onClick={closeModal}>
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBooking;
