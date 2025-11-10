// src/components/Footer/Footer.jsx
import React from 'react';
import '../styles/Footer.css';
import { Phone, Mail } from 'lucide-react'; // Dùng lucide-react (cài: npm i lucide-react)

const Footer = () => {
  return (
    <footer className="footer">
      {/* Decorative Top Wave */}
      <div className="footer-wave">
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" 
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="footer-container">
        {/* Main Info Section */}
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon">
                <i className="fas fa-bolt"></i>
              </div>
              <span className="logo-text">EV STATION</span>
            </div>
            <p className="footer-desc">
              Hệ thống quản lý trạm sạc xe điện thông minh, mang đến trải nghiệm sạc nhanh chóng, tiện lợi và thân thiện với môi trường.
            </p>
            {/* Social Links */}
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://github.com/ptdat30/EV-Charging-Station-Management-System" className="social-link" aria-label="GitHub">
                <i className="fab fa-github"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="footer-links-grid">
          {/* Cột 1: Liên kết */}
          <div className="footer-col">
            <h3 className="footer-title">Liên Kết</h3>
            <ul className="footer-links">
              <li><a href="/"><i className="fas fa-home"></i> Trang chủ</a></li>
              <li><a href="/map"><i className="fas fa-map-marked-alt"></i> Tìm trạm sạc</a></li>
              <li><a href="/pricing"><i className="fas fa-tags"></i> Bảng giá</a></li>
              <li><a href="/about"><i className="fas fa-info-circle"></i> Giới thiệu</a></li>
            </ul>
          </div>

          {/* Cột 2: Hỗ trợ */}
          <div className="footer-col">
            <h3 className="footer-title">Hỗ Trợ</h3>
            <ul className="footer-links">
              <li><a href="/faq"><i className="fas fa-question-circle"></i> Câu hỏi thường gặp</a></li>
              <li><a href="/help"><i className="fas fa-life-ring"></i> Trung tâm trợ giúp</a></li>
              <li><a href="/terms"><i className="fas fa-file-contract"></i> Điều khoản</a></li>
              <li><a href="/privacy"><i className="fas fa-shield-alt"></i> Bảo mật</a></li>
            </ul>
          </div>

          {/* Cột 3: Liên hệ */}
          <div className="footer-col">
            <h3 className="footer-title">Liên Hệ</h3>
            <ul className="footer-contact">
              <li>
                <i className="fas fa-phone-alt"></i>
                <span>Hotline: <strong>1900 1234</strong></span>
              </li>
              <li>
                <i className="fas fa-envelope"></i>
                <a href="mailto:support@evcharge.vn">support@evcharge.vn</a>
              </li>
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <span>TP. Hồ Chí Minh, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>© 2025 EV Charging Station. Made with <i className="fas fa-heart"></i> by Mr. Chien's IT Group</p>
          <div className="footer-bottom-links">
            <a href="/privacy">Privacy</a>
            <span>•</span>
            <a href="/terms">Terms</a>
            <span>•</span>
            <a href="/cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;