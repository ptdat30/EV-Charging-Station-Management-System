// src/components/CTASection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/CTASection.css';

const CTASection = ({ onRegisterClick }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate('/map');
    } else if (onRegisterClick) {
      onRegisterClick();
    } else {
      navigate('/register');
    }
  };

  return (
    <section className="cta-section">
      <div className="cta-container">
        <div className="cta-content">
          <div className="cta-icon">
            <i className="fas fa-bolt"></i>
          </div>
          <h2 className="cta-title">
            Bắt Đầu Sạc Xe Ngay Hôm Nay
          </h2>
          <p className="cta-description">
            Tham gia cùng hàng nghìn tài xế đang sử dụng hệ thống sạc xe điện thông minh của chúng tôi
          </p>
          <button className="cta-button" onClick={handleCTA}>
            <span>{isAuthenticated ? 'Tìm Trạm Sạc Ngay' : 'Đăng Ký Miễn Phí'}</span>
            <i className="fas fa-arrow-right"></i>
          </button>
          <p className="cta-note">
            <i className="fas fa-check-circle"></i>
            Không cần thẻ tín dụng • Miễn phí đăng ký • Hủy bất cứ lúc nào
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="cta-decoration decoration-1"></div>
      <div className="cta-decoration decoration-2"></div>
      <div className="cta-decoration decoration-3"></div>
    </section>
  );
};

export default CTASection;

