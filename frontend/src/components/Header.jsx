// src/components/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <div className="logo-icon">EV</div>
          <span className="logo-text">EVCharge</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="nav-menu">
          <Link to="/" className="nav-link active">Trang chủ</Link>
          <Link to="/map" className="nav-link">Tìm trạm sạc</Link>
          <Link to="/pricing" className="nav-link">Bảng giá</Link>
          <Link to="/payment" className="nav-link">
  <i className="fas fa-credit-card"></i> Thanh toán
</Link>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
        </nav>

        {/* Auth Buttons */}
        <div className="auth-buttons">
          <Link to="/login" className="btn-login">Đăng nhập</Link>
          <Link to="/register" className="btn-register">Đăng ký</Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="hamburger"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <Link to="/" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Trang chủ</Link>
        <Link to="/map" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Tìm trạm sạc</Link>
        <Link to="/pricing" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Bảng giá</Link>
        <div className="mobile-auth">
          <Link to="/login" className="btn-login mobile" onClick={() => setIsMobileMenuOpen(false)}>Đăng nhập</Link>
          <Link to="/register" className="btn-register mobile" onClick={() => setIsMobileMenuOpen(false)}>Đăng ký</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;