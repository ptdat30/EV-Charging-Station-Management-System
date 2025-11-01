// src/components/admin/AdminHeader.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminHeader = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lấy title dựa trên route
  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/admin': 'Tổng quan',
      '/admin/stations': 'Quản lý Trạm Sạc',
      '/admin/users': 'Quản lý Người dùng',
      '/admin/transactions': 'Giao dịch',
      '/admin/reports': 'Báo cáo',
      '/admin/maintenance': 'Bảo trì',
      '/admin/settings': 'Cài đặt',
    };
    return titles[path] || 'Quản trị Hệ thống';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <button 
          className="menu-toggle-btn" 
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i className="fas fa-bars"></i>
        </button>
        <div className="page-title">
          <h1>{getPageTitle()}</h1>
          <p className="breadcrumb">
            <span>Trang chủ</span>
            <i className="fas fa-chevron-right"></i>
            <span>{getPageTitle()}</span>
          </p>
        </div>
      </div>

      <div className="header-right">
        {/* Search */}
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Tìm kiếm..." 
            className="search-input"
          />
        </div>

        {/* Notifications */}
        <button className="header-icon-btn notification-btn">
          <i className="fas fa-bell"></i>
          <span className="notification-badge">3</span>
        </button>

        {/* User Dropdown */}
        <div className="user-dropdown-container" ref={dropdownRef}>
          <button 
            className="user-menu-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="user-avatar-small">
              {user?.email ? (
                <span>{user.email.charAt(0).toUpperCase()}</span>
              ) : (
                <i className="fas fa-user"></i>
              )}
            </div>
            <div className="user-details">
              <span className="user-name-small">{user?.fullName || user?.email || 'Admin'}</span>
              <span className="user-role-small">Quản trị viên</span>
            </div>
            <i className={`fas fa-chevron-${dropdownOpen ? 'up' : 'down'}`}></i>
          </button>

          {dropdownOpen && (
            <div className="user-dropdown-menu">
              <div className="dropdown-header">
                <div className="dropdown-avatar">
                  {user?.email ? (
                    <span>{user.email.charAt(0).toUpperCase()}</span>
                  ) : (
                    <i className="fas fa-user"></i>
                  )}
                </div>
                <div>
                  <p className="dropdown-name">{user?.fullName || user?.email || 'Admin'}</p>
                  <p className="dropdown-email">{user?.email || 'admin@evcharge.vn'}</p>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <a href="#" className="dropdown-item">
                <i className="fas fa-user"></i>
                <span>Hồ sơ</span>
              </a>
              <a href="#" className="dropdown-item">
                <i className="fas fa-cog"></i>
                <span>Cài đặt</span>
              </a>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout-item" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
