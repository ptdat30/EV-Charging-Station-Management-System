// src/components/admin/AdminLayout.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';  // ← ĐÚNG
import '../../styles/AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="admin-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* SỬA DÒNG NÀY: DÙNG AdminHeader, KHÔNG PHẢI Admin.Header */}
        <AdminHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;