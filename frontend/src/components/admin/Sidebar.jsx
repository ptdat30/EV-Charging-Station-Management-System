// src/components/admin/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { 
      icon: 'fas fa-home', 
      text: 'Tổng quan', 
      path: '/admin',
      badge: null
    },
    // Quản lý trạm & điểm sạc
    { 
      icon: 'fas fa-charging-station', 
      text: 'Trạm sạc', 
      path: '/admin/stations',
      badge: null,
      submenu: [
        { icon: 'fas fa-list', text: 'Danh sách trạm', path: '/admin/stations' },
        { icon: 'fas fa-map-marker-alt', text: 'Điểm sạc', path: '/admin/stations/charging-points' },
        { icon: 'fas fa-chart-line', text: 'Theo dõi tình trạng', path: '/admin/stations/monitoring' },
        { icon: 'fas fa-sliders-h', text: 'Điều khiển từ xa', path: '/admin/stations/remote-control' },
      ]
    },
    { 
      icon: 'fas fa-calendar-check', 
      text: 'Đặt chỗ', 
      path: '/admin/reservations',
      badge: null
    },
    // Quản lý người dùng & gói dịch vụ
    { 
      icon: 'fas fa-users', 
      text: 'Người dùng', 
      path: '/admin/users',
      badge: null,
      submenu: [
        { icon: 'fas fa-user', text: 'Khách hàng cá nhân', path: '/admin/users/individual' },
        { icon: 'fas fa-building', text: 'Khách hàng doanh nghiệp', path: '/admin/users/business' },
        { icon: 'fas fa-id-card', text: 'Nhân viên trạm', path: '/admin/users/staff' },
      ]
    },
    { 
      icon: 'fas fa-box', 
      text: 'Gói dịch vụ', 
      path: '/admin/packages',
      badge: null,
      submenu: [
        { icon: 'fas fa-credit-card', text: 'Gói trả trước', path: '/admin/packages/prepaid' },
        { icon: 'fas fa-calendar-check', text: 'Gói trả sau', path: '/admin/packages/postpaid' },
        { icon: 'fas fa-crown', text: 'Gói VIP', path: '/admin/packages/vip' },
      ]
    },
    { 
      icon: 'fas fa-user-shield', 
      text: 'Phân quyền', 
      path: '/admin/permissions',
      badge: null
    },
    { 
      icon: 'fas fa-file-invoice-dollar', 
      text: 'Giao dịch', 
      path: '/admin/transactions',
      badge: null
    },
    { 
      icon: 'fas fa-chart-bar', 
      text: 'Báo cáo', 
      path: '/admin/reports',
      badge: null
    },
    { 
      icon: 'fas fa-bell', 
      text: 'Thông báo hệ thống', 
      path: '/admin/notifications',
      badge: null
    },
    { 
      icon: 'fas fa-cog', 
      text: 'Cài đặt', 
      path: '/admin/settings',
      badge: null
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          {isOpen && (
            <div className="logo-text">
              <span className="logo-title blinking">E-CHARGE STATION</span>
            </div>
          )}
        </div>
        <button 
          className="sidebar-toggle-btn" 
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i className={`fas fa-chevron-${isOpen ? 'left' : 'right'}`}></i>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul className="nav-menu">
          {menuItems.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `nav-item ${isActive ? 'active' : ''}`
                }
                end={item.path === '/admin'}
              >
                <i className={item.icon}></i>
                {isOpen && (
                  <>
                    <span className="nav-text">{item.text}</span>
                    {item.badge && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                    {item.submenu && (
                      <i className="fas fa-chevron-down nav-chevron"></i>
                    )}
                  </>
                )}
              </NavLink>
              {/* Submenu - sẽ được implement sau với dropdown */}
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.email ? (
              <span>{user.email.charAt(0).toUpperCase()}</span>
            ) : (
              <i className="fas fa-user"></i>
            )}
          </div>
          {isOpen && (
            <div className="user-info">
              <p className="user-name">{user?.fullName || user?.email || 'Admin'}</p>
              <p className="user-role">Quản trị viên</p>
            </div>
          )}
        </div>
        {isOpen && (
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Đăng xuất</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
