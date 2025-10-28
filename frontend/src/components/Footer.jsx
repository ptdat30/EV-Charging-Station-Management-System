// src/components/Footer/Footer.jsx
import React from 'react';
import '../styles/Footer.css';
import { Phone, Mail } from 'lucide-react'; // Dùng lucide-react (cài: npm i lucide-react)

const Footer = () => {
  return (
    <footer className="footer">
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