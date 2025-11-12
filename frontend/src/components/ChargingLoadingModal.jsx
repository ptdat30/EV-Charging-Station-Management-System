// src/components/ChargingLoadingModal.jsx
import React from 'react';
import '../styles/ChargingLoadingModal.css';

const ChargingLoadingModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="charging-loading-overlay">
      <div className="charging-loading-content">
        <div className="charging-video-container">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="charging-video"
          >
            <source src="/charging-animation.mp4" type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ video.
          </video>
        </div>
        
        <div className="charging-loading-text">
          <div className="charging-spinner">
            <i className="fas fa-bolt"></i>
          </div>
          <h3>Đang khởi động phiên sạc...</h3>
          <p>Vui lòng đợi trong giây lát</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargingLoadingModal;

