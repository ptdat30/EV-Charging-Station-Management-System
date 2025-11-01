// src/components/admin/AdminLayout.jsx
import React from 'react';
import AdminNavBar from './AdminNavBar';
import '../../styles/AdminLayout.css';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <AdminNavBar />
      <main className="admin-page-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
