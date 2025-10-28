// src/pages/AdminPage.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import DashboardContent from '../components/admin/DashboardContent';
import StationsManagement from '../components/admin/StationsManagement';
import UsersManagement from '../components/admin/UsersManagement';
import RevenueReport from '../components/admin/RevenueReport';
import SettingsPage from '../components/admin/SettingsPage';

const AdminPage = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<DashboardContent />} />
        <Route path="/stations" element={<StationsManagement />} />
        <Route path="/users" element={<UsersManagement />} />
        <Route path="/revenue" element={<RevenueReport />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminPage;