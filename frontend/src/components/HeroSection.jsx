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
        {!isAuthenticated && (
          <>
            <div className="hero-brand">
              <div className="hero-brand-logo">
                <svg 
                  viewBox="0 0 200 200" 
                  className="logo-svg"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <filter id="lightning-glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
                      <feColorMatrix in="blur" type="matrix" 
                        values="0 0 0 0 0
                                0 0 0 0 1
                                0 0 0 0 0
                                0 0 0 1 0" 
                        result="glow"/>
                      <feMerge>
                        <feMergeNode in="glow"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Vòng tròn bao quanh không khép kín */}
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="85" 
                    fill="none" 
                    stroke="#1a4d6b" 
                    strokeWidth="4"
                    strokeDasharray="500"
                    strokeDashoffset="50"
                    className="logo-circle"
                  />
                  
                  {/* Icon tia sét ⚡ với màu và hiệu ứng */}
                  <text 
                    x="100" 
                    y="110" 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    fontSize="120"
                    className="logo-lightning"
                    fill="#4caf50"
                  >
                    ⚡
                  </text>
                </svg>
                <div className="logo-text-container">
                  <div className="logo-text-echarge">E-CHARGE</div>
                  <div className="logo-text-station">STATION</div>
                </div>
              </div>
              <p className="hero-brand-tagline">Hệ Thống Sạc Xe Điện Của Sinh Viên UTH</p>
            </div>
            <div className="hero-auth-buttons">
              <button className="hero-btn-login" onClick={onLoginClick}>
                <i className="fas fa-sign-in-alt"></i>
                Đăng Nhập
              </button>
              <button className="hero-btn-register" onClick={onRegisterClick}>
                <i className="fas fa-user-plus"></i>
                Đăng Ký
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default HeroSection;