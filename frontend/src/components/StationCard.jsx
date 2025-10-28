// src/components/StationCard.jsx
import React from 'react';

const StationCard = ({ station }) => {
  return (
    <div className="station-card">
      <img src={station.image} alt={station.name} className="station-img" />
      <div className="station-info">
        <h3>{station.name}</h3>
        <p className="distance">
          {station.distance}
          <br />
          {station.address}
        </p>
        <div className="rating">
          {station.rating} <i className="fas fa-star"></i> ({station.reviews})
        </div>
        <div className="tags">
          {station.types.map((type, i) => (
            <span key={i} className="tag">{type}</span>
          ))}
        </div>
        <div className="price">{station.price}</div>
      </div>
      <div className="station-actions">
        <button className="btn-book">Đặt chỗ</button>
        <button className="btn-detail">Chi tiết</button>
      </div>
    </div>
  );
};

export default StationCard;