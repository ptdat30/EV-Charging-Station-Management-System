import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import các trang của bạn
import LoginPage from '../pages/DriverApp/Auth/LoginPage';
import RegisterPage from '../pages/DriverApp/Auth/RegisterPage';
import ForgotPasswordScreen from '../pages/DriverApp/Auth/ForgotPasswordScreen';
import UserProfileScreen from '../pages/DriverApp/Profile/UserProfileScreen';

// Import ProtectedRoute
import ProtectedRoute from './ProtectedRoute';

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* --- Public Routes --- */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordScreen />} />

                {/* --- Protected Routes --- */}
                {/* Tất cả các route bên trong ProtectedRoute sẽ được bảo vệ */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Navigate to="/driver/profile" replace />} />
                    <Route path="/driver/profile" element={<UserProfileScreen />} />
                    {/* Thêm các trang cần bảo vệ khác ở đây */}
                    {/* Ví dụ: <Route path="/driver/history" element={<HistoryScreen />} /> */}
                </Route>

                {/* Route cho các trang không tồn tại */}
                <Route path="*" element={<h1>404 - Trang không tồn tại</h1>} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;