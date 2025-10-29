// src/components/HeroSection.jsx
import React from 'react';
import '../styles/HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Tìm và đặt trạm sạc xe điện<br />
          <span className="highlight">dễ dàng</span>
        </h1>
        <p className="hero-description">
          Khám phá mạng lưới trạm sạc rộng khắp, đặt chỗ trước và thanh toán tiện lợi
        </p>

        <div className="hero-search">
          <div className="search-input-wrapper">
            <i className="fas fa-location-dot search-icon"></i>
            <input
              type="text"
              placeholder="Nhập địa điểm của bạn..."
              className="search-input"
            />
          </div>
          <button className="search-btn_hero">
            <i className="fas fa-search"></i> Tìm kiếm
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;