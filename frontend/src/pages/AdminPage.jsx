// src/pages/AdminPage.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import DashboardContent from '../components/admin/DashboardContent';
import StationsManagement from '../components/admin/StationsManagement';
import UsersManagement from '../components/admin/UsersManagement';
import PackagesManagement from '../components/admin/PackagesManagement';
import RevenueReport from '../components/admin/RevenueReport';
import SettingsPage from '../components/admin/SettingsPage';

// TODO: Sẽ tạo các component sau:
// - TransactionsManagement (Giao dịch)
// - ReportsPage (Báo cáo)
// - MaintenancePage (Bảo trì)

const AdminPage = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<DashboardContent />} />
        <Route path="stations" element={<StationsManagement />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="packages" element={<PackagesManagement />} />
        <Route path="transactions" element={<div>Tính năng đang phát triển...</div>} />
        <Route path="reports" element={<RevenueReport />} />
        <Route path="maintenance" element={<div>Tính năng đang phát triển...</div>} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminPage;