// src/components/Footer/Footer.jsx
import React from 'react';
import '../styles/Footer.css';
import { Phone, Mail } from 'lucide-react'; // Dùng lucide-react (cài: npm i lucide-react)

const Footer = () => {
  return (
    <footer className="footer">
      {/* Animation Section - Xe điện chạy */}
      <div className="footer-car-animation">
        <div className="car-track">
          {/* Xe 1 */}
          <svg 
            className="moving-car car-1" 
            viewBox="0 0 100 60" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Thân xe */}
            <path 
              d="M 10 35 Q 10 30 15 28 L 25 26 L 35 25 L 50 26 L 60 28 Q 65 30 65 35 L 65 42 L 60 45 L 55 44 L 45 44 L 40 44 L 30 44 L 25 44 L 20 45 L 15 42 Z" 
              fill="#4caf50"
            />
            {/* Cửa sổ */}
            <path 
              d="M 25 26 L 35 25 L 50 26 L 50 34 L 35 34 L 25 34 Z" 
              fill="#2e7d32"
              opacity="0.4"
            />
            {/* Bánh xe trái */}
            <circle cx="30" cy="44" r="6" fill="none" stroke="#1a4d6b" strokeWidth="1.5" />
            <circle cx="30" cy="44" r="3" fill="#1a4d6b" />
            {/* Bánh xe phải */}
            <circle cx="55" cy="44" r="6" fill="none" stroke="#1a4d6b" strokeWidth="1.5" />
            <circle cx="55" cy="44" r="3" fill="#1a4d6b" />
            {/* Đèn pha */}
            <ellipse cx="15" cy="28" rx="2" ry="1.5" fill="#ffffff" opacity="0.9" />
          </svg>
          
          {/* Xe 2 - cách xa để tạo hiệu ứng liên tục */}
          <svg 
            className="moving-car car-2" 
            viewBox="0 0 100 60" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Thân xe */}
            <path 
              d="M 10 35 Q 10 30 15 28 L 25 26 L 35 25 L 50 26 L 60 28 Q 65 30 65 35 L 65 42 L 60 45 L 55 44 L 45 44 L 40 44 L 30 44 L 25 44 L 20 45 L 15 42 Z" 
              fill="#4caf50"
            />
            {/* Cửa sổ */}
            <path 
              d="M 25 26 L 35 25 L 50 26 L 50 34 L 35 34 L 25 34 Z" 
              fill="#2e7d32"
              opacity="0.4"
            />
            {/* Bánh xe trái */}
            <circle cx="30" cy="44" r="6" fill="none" stroke="#1a4d6b" strokeWidth="1.5" />
            <circle cx="30" cy="44" r="3" fill="#1a4d6b" />
            {/* Bánh xe phải */}
            <circle cx="55" cy="44" r="6" fill="none" stroke="#1a4d6b" strokeWidth="1.5" />
            <circle cx="55" cy="44" r="3" fill="#1a4d6b" />
            {/* Đèn pha */}
            <ellipse cx="15" cy="28" rx="2" ry="1.5" fill="#ffffff" opacity="0.9" />
          </svg>
        </div>
      </div>

      <div className="footer-container">
        
        {/* Cột 1: Logo & Mô tả */}
        <div className="footer-col">
          <div className="footer-logo">
            <span className="logo-icon">EV</span>
            <span className="logo-text">EVCharge</span>
          </div>
          <p className="footer-desc">
            Vận hành bởi EVCharge Việt Nam cung cấp dịch vụ tìm kiếm và đặt trạm sạc điện, giúp việc di chuyển trở nên dễ dàng và tiện lợi hơn bao giờ hết.
          </p>
        </div>

        {/* Cột 2: Liên kết nhanh */}
        <div className="footer-col">
          <h3 className="footer-title">Liên kết nhanh</h3>
          <ul className="footer-links">
            <li><a href="/">Trang chủ</a></li>
            <li><a href="/map">Tìm trạm sạc</a></li>
            <li><a href="/pricing">Bảng giá</a></li>
            <li><a href="/blog">Tin tức</a></li>
          </ul>
        </div>

        {/* Cột 3: Hỗ trợ khách hàng */}
        <div className="footer-col">
          <h3 className="footer-title">Hỗ trợ khách hàng</h3>
          <ul className="footer-links">
            <li className="contact-item">
              <Phone size={16} />
              <span>1900 1234</span>
            </li>
            <li className="contact-item">
              <Mail size={16} />
              <a href="mailto:support@evcharge.vn">support@evcharge.vn</a>
            </li>
            <li>
              <strong>Thời gian:</strong> T2 - T6, 8h - 17h
            </li>
          </ul>
        </div>

        {/* Cột 4: Chính sách */}
        <div className="footer-col">
          <h3 className="footer-title">Chính sách</h3>
          <ul className="footer-links">
            <li><a href="/privacy">Chính sách bảo mật</a></li>
            <li><a href="/terms">Điều khoản sử dụng</a></li>
            <li><a href="/refund">Chính sách hoàn tiền</a></li>
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p>© 2025 EVCharge. Tầng 10, Tòa nhà ABC, Quận 1, TP.HCM</p>
      </div>
    </footer>
  );
};

export default Footer;