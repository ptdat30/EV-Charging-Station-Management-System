// src/components/admin/AdminHeader.jsx
import React from 'react';

const AdminHeader = ({ toggleSidebar }) => {
  return (
    <header className="admin-header">
      <button className="menu-toggle" onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </button>
      <div className="header-title">
        <h2>Quản trị hệ thống</h2>
      </div>
      <div className="header-actions">
        <button className="notification-btn">
          <i className="fas fa-bell"></i>
          <span className="badge">3</span>
        </button>
        <div className="user-dropdown">
          <div className="user-avatar">
            <i className="fas fa-user"></i>
          </div>
          <i className="fas fa-chevron-down"></i>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;