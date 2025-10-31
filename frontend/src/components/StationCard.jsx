// src/components/StationCard.jsx
import React, { useState } from 'react';
import BookingModal from './BookingModal';
import { useNavigate } from 'react-router-dom';

const StationCard = ({ station }) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const navigate = useNavigate();

  const handleQuickBook = () => {
    setIsBookingOpen(true);
  };

  const handleBookClick = () => {
    setIsBookingOpen(true);
  };

  const handleBookingSuccess = (reservation) => {
    // Optionally navigate to booking details or refresh
    console.log('Booking successful:', reservation);
  };

  return (
    <>
      <div className="station-card">
        <img src={station.image} alt={station.name} className="station-img" />
        <div className="station-info">
          <h3>{station.name}</h3>
          <p className="distance">
            <i className="fas fa-map-marker-alt"></i>
            {station.distance}
            <br />
            {station.address}
          </p>
          <div className="rating">
            <i className="fas fa-star"></i>
            <strong>{station.rating}</strong> 
            <span className="reviews">({station.reviews} đánh giá)</span>
          </div>
          <div className="tags">
            {station.types?.map((type, i) => (
              <span key={i} className="tag">
                <i className="fas fa-plug"></i>
                {type}
              </span>
            ))}
          </div>
          <div className="price">
            <i className="fas fa-money-bill-wave"></i>
            {station.price}
          </div>
        </div>
        <div className="station-actions">
          <button 
            className="btn-quick-book-card"
            onClick={handleQuickBook}
            title="Đặt chỗ nhanh"
          >
            <i className="fas fa-bolt"></i>
            Đặt nhanh
          </button>
          <button 
            className="btn-book"
            onClick={handleBookClick}
          >
            <i className="fas fa-calendar-check"></i>
            Đặt chỗ
          </button>
          <button 
            className="btn-detail"
            onClick={() => navigate(`/stations/${station.id}`)}
          >
            <i className="fas fa-info-circle"></i>
            Chi tiết
          </button>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        station={station}
        onSuccess={handleBookingSuccess}
      />
    </>
  );
};

export default StationCard;