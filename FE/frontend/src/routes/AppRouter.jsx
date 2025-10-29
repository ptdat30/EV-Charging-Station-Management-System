// src/routes/AppRouter.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import RegisterPage from '../pages/DriverApp/Auth/RegisterPage';
import ForgotPasswordScreen from '../pages/DriverApp/Auth/ForgotPasswordScreen';
import UserProfileScreen from '../pages/DriverApp/Profile/UserProfileScreen';
import HomePage from '../components/HomePage';
import Login from '../components/Login';
import Register from '../components/Register';
import ProtectedRoute from './ProtectedRoute';
import FindStationPage from '../pages/FindStationPage';
import Dashboard from '../components/Dashboard';
import AdminLayout from '../components/admin/AdminLayout';

// SỬA ĐÚNG ĐƯỜNG DẪN
import DashboardContent from '../components/admin/DashboardContent';

import PricingPage from '../pages/PricingPage';
import AdminPage from '../pages/AdminPage';
import PaymentPage from '../pages/PaymentPage';
function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/map" element={<FindStationPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/driver/profile" element={<UserProfileScreen />} />
        </Route>

        {/* Admin */}
        <Route path="/admin/*" element={<AdminPage />} />

        {/* 404 */}
        <Route path="*" element={<h1>404 - Trang không tồn tại</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;