// src/components/admin/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { icon: 'fas fa-tachometer-alt', text: 'Tổng quan', path: '/admin' },
    { icon: 'fas fa-charging-station', text: 'Quản lý trạm', path: '/admin/stations' },
    { icon: 'fas fa-users', text: 'Người dùng', path: '/admin/users' },
    { icon: 'fas fa-chart-line', text: 'Doanh thu', path: '/admin/revenue' },
    { icon: 'fas fa-tools', text: 'Bảo trì', path: '/admin/maintenance' },
    { icon: 'fas fa-cog', text: 'Cài đặt', path: '/admin/settings' },
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="logo">
          <i className="fas fa-bolt"></i>
          {isOpen && <span>EV Admin</span>}
        </div>
        <button className="toggle-btn" onClick={toggleSidebar}>
          <i className={`fas fa-chevron-${isOpen ? 'left' : 'right'}`}></i>
        </button>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item, i) => (
          <NavLink
            key={i}
            to={item.path}
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
            end
          >
            <i className={item.icon}></i>
            {isOpen && <span>{item.text}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar">
            <i className="fas fa-user"></i>
          </div>
          {isOpen && (
            <div>
              <p className="name">Quản trị viên</p>
              <p className="role">admin@evcharge.vn</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;