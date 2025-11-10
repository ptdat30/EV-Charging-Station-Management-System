// src/components/HeroSection.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/HeroSection.css';

const HeroSection = ({ onLoginClick, onRegisterClick }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isGitHubCardOpen, setIsGitHubCardOpen] = useState(false);

  const handleExploreStations = () => {
    navigate('/map');
  };

  const scrollToNextSection = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="hero">
      {/* Background Image/Video */}
      <div className="hero-background">
        <video 
          className="hero-video" 
          autoPlay 
          loop 
          muted 
          playsInline
          poster="/car_banner.png"
        >
          <source src="/24122-340657801.mp4" type="video/mp4" />
        </video>
      </div>
      
      {/* Overlay */}
      <div className="hero-overlay"></div>

      {/* Main Content */}
      <div className="hero-container">
        {/* Left Side - Main Headlines */}
        <div className="hero-main-content">
          <h1 className="hero-headline">
            <span className="hero-headline-line">EV STATION</span>
          </h1>
          <p className="hero-subheadline">
            Mr. Chien's IT group from UTH
          </p>
        </div>

        {/* Right Side - Info Box */}
        <div className="hero-info-box">
          <div className="hero-info-content">
            {/* CTA Buttons */}
            <div className="hero-cta-buttons">
              {!isAuthenticated ? (
                <>
                  <button className="hero-btn-primary" onClick={onRegisterClick}>
                    <i className="fas fa-user-plus"></i>
                    Đăng Ký
                  </button>
                  <button className="hero-btn-secondary" onClick={onLoginClick}>
                    <i className="fas fa-sign-in-alt"></i>
                    Đăng Nhập
                  </button>
                </>
              ) : (
                <>
                  <button className="hero-btn-primary" onClick={handleExploreStations}>
                    <i className="fas fa-charging-station"></i>
                    Tìm Trạm Sạc
                  </button>
                  <button className="hero-btn-secondary" onClick={() => navigate('/driver/dashboard')}>
                    <i className="fas fa-tachometer-alt"></i>
                    Dashboard
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button className="hero-scroll-indicator" onClick={scrollToNextSection} aria-label="Scroll down">
        <i className="fas fa-chevron-down"></i>
        <i className="fas fa-chevron-down"></i>
      </button>

      {/* GitHub Floating Bubble */}
      <button 
        className="github-bubble"
        onClick={() => setIsGitHubCardOpen(true)}
        aria-label="View GitHub Repository"
      >
        <i className="fab fa-github"></i>
      </button>

      {/* GitHub Card Modal */}
      {isGitHubCardOpen && (
        <div className="github-modal-overlay" onClick={() => setIsGitHubCardOpen(false)}>
          <div className="github-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="github-modal-close"
              onClick={() => setIsGitHubCardOpen(false)}
              aria-label="Close"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="github-card">
              {/* Repository Owner Profile */}
              <div className="repo-owner">
                <a 
                  href="https://github.com/ptdat30" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="owner-link"
                >
                  <div className="owner-avatar">
                    <img 
                      src="https://github.com/ptdat30.png" 
                      alt="Huỳnh Phong Đạt"
                    />
                    <div className="avatar-badge">
                      <i className="fas fa-crown"></i>
                    </div>
                  </div>
                  <div className="owner-info">
                    <h4>Huỳnh Phong Đạt</h4>
                    <p>@ptdat30</p>
                    <div className="owner-stats">
                      <span><i className="fas fa-users"></i> 1 follower</span>
                      <span><i className="fas fa-code-branch"></i> 4 repos</span>
                    </div>
                  </div>
                  <div className="owner-badge-icon">
                    <i className="fas fa-external-link-alt"></i>
                  </div>
                </a>
              </div>

              <div className="divider"></div>

              {/* Repository Info */}
              <div className="github-header">
                <i className="fab fa-github github-icon"></i>
                <div className="github-title">
                  <h3>Open Source Project</h3>
                  <p>EV Charging Station Management System</p>
                </div>
              </div>
              
              <div className="github-stats">
                <div className="stat-item">
                  <i className="fas fa-star"></i>
                  <span>Star</span>
                </div>
                <div className="stat-item">
                  <i className="fas fa-code-branch"></i>
                  <span>Fork</span>
                </div>
                <div className="stat-item">
                  <i className="fas fa-users"></i>
                  <span>3 Contributors</span>
                </div>
              </div>

              <a 
                href="https://github.com/ptdat30/EV-Charging-Station-Management-System" 
                target="_blank" 
                rel="noopener noreferrer"
                className="github-link"
              >
                <i className="fab fa-github"></i>
                <span>View Repository</span>
                <i className="fas fa-external-link-alt"></i>
              </a>

              <div className="tech-stack">
                <span className="tech-badge js">JavaScript 49.5%</span>
                <span className="tech-badge java">Java 25.3%</span>
                <span className="tech-badge css">CSS 24.7%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;