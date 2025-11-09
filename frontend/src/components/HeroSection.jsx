// src/components/HeroSection.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/HeroSection.css';

const HeroSection = ({ onLoginClick, onRegisterClick }) => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="hero">
      {/* Video Background */}
      <video 
        className="hero-video" 
        autoPlay 
        loop 
        muted 
        playsInline
        poster="/car_banner.png"
      >
        <source src="/24122-340657801.mp4" type="video/mp4" />
        {/* Fallback nếu video không load được */}
        Your browser does not support the video tag.
      </video>
      
      {/* Overlay */}
      <div className="hero-overlay"></div>

      <div className="hero-content">
        {/* Hiển thị nút đăng nhập/đăng ký (cho phép mở modal ngay cả khi đã authenticated) */}
        <div className="hero-auth-buttons">
          {onLoginClick && (
            <button className="hero-btn-login" onClick={onLoginClick}>
              <i className="fas fa-sign-in-alt"></i>
              Đăng Nhập
            </button>
          )}
          {onRegisterClick && (
            <button className="hero-btn-register" onClick={onRegisterClick}>
              <i className="fas fa-user-plus"></i>
              Đăng Ký
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;