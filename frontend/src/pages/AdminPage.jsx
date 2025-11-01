// src/pages/AdminPage.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import DashboardContent from '../components/admin/DashboardContent';
import StationsManagement from '../components/admin/StationsManagement';
import ReservationsManagement from '../components/admin/ReservationsManagement';
import UsersManagement from '../components/admin/UsersManagement';
import PackagesManagement from '../components/admin/PackagesManagement';
import TransactionsManagement from '../components/admin/TransactionsManagement';
import PermissionsManagement from '../components/admin/PermissionsManagement';
import RevenueReport from '../components/admin/RevenueReport';
import SettingsPage from '../components/admin/SettingsPage';

// TODO: Sẽ tạo các component sau:
// - MaintenancePage (Bảo trì)

const AdminPage = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<DashboardContent />} />
        <Route path="stations" element={<StationsManagement />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="packages" element={<PackagesManagement />} />
        <Route path="permissions" element={<PermissionsManagement />} />
        <Route path="transactions" element={<TransactionsManagement />} />
        <Route path="reservations" element={<ReservationsManagement />} />
        <Route path="reports" element={<RevenueReport />} />
        <Route path="maintenance" element={<div>Tính năng đang phát triển...</div>} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminPage;