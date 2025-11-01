// src/components/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

const Header = ({ onLoginClick, onRegisterClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Navigate trước để tránh ProtectedRoute redirect về login
    navigate('/', { replace: true });
    // Sau đó mới logout để clear state
    setTimeout(() => {
      logout();
    }, 0);
  };

  const handleLoginClick = (e) => {
    if (onLoginClick) {
      e.preventDefault();
      onLoginClick();
    }
  };

  const handleRegisterClick = (e) => {
    if (onRegisterClick) {
      e.preventDefault();
      onRegisterClick();
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
        </Link>

        {/* Desktop Menu */}
        <nav className="nav-menu">
          <Link to="/" className="nav-link active">Trang chủ</Link>
          <Link to="/map" className="nav-link">Tìm trạm sạc</Link>
          {/* Menu items khi đã đăng nhập sẽ hiển thị trong DriverNavBar, không cần ở đây */}
        </nav>

        {/* Auth Buttons */}
        <div className="auth-buttons">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn-login" onClick={handleLoginClick}>Đăng nhập</Link>
              <Link to="/register" className="btn-register" onClick={handleRegisterClick}>Đăng ký</Link>
            </>
          ) : (
            <div className="user-area">
              <span className="user-chip"><i className="fas fa-user-circle"></i> {user?.email || 'User'}</span>
              <button className="btn-logout" onClick={handleLogout}>Đăng xuất</button>
            </div>
          )}
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
        {isAuthenticated && (
          <>
            <Link to="/driver/profile/history" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Lịch sử sạc</Link>
            <Link to="/driver/profile/info" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Hồ sơ cá nhân</Link>
            <Link to="/driver/profile/vehicles" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Quản lý xe</Link>
            <Link to="/payment" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Ví điện tử</Link>
            <button className="mobile-link" onClick={()=>{ setIsMobileMenuOpen(false); handleLogout(); }}>Đăng xuất</button>
          </>
        )}
        {!isAuthenticated && (
          <div className="mobile-auth">
            <Link 
              to="/login" 
              className="btn-login mobile" 
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                handleLoginClick(e);
              }}
            >
              Đăng nhập
            </Link>
            <Link 
              to="/register" 
              className="btn-register mobile" 
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                handleRegisterClick(e);
              }}
            >
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;