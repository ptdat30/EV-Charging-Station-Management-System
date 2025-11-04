// src/routes/AppRouter.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import các trang công khai
import HomePage from '../components/HomePage';
import Login from '../components/Login';
import Register from '../components/Register';
import VerifyAccount from '../pages/DriverApp/Auth/VerifyAccount.jsx';
import ForgotPasswordScreen from '../pages/DriverApp/Auth/ForgotPasswordScreen';
import FindStationPage from '../pages/FindStationPage';
import PricingPage from '../pages/PricingPage';

// Import các trang cần bảo vệ
import ProtectedRoute from './ProtectedRoute';
import DriverLayout from '../components/DriverLayout';
import Dashboard from '../components/Dashboard';
import UserProfileScreen from '../pages/DriverApp/Profile/UserProfileScreen';
import PaymentPage from '../pages/PaymentPage';
import WalletPage from '../pages/Wallet/WalletPage.jsx';
import BookingPage from '../pages/DriverApp/Booking/BookingPage.jsx';
import QRScanner from '../pages/DriverApp/QR/QRScanner.jsx';
import ChargingLive from '../pages/DriverApp/Charging/ChargingLive.jsx';
import NotificationsPage from '../pages/DriverApp/Notifications/NotificationsPage.jsx';
import RoutePlanningPage from '../pages/DriverApp/RoutePlanning/RoutePlanningPage.jsx';

// Import trang Admin
import AdminPage from '../pages/AdminPage';

// Import trang Staff
import StaffPage from '../pages/StaffPage';

function AppRouter() {
    return (
        <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route index element={<HomePage />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="verify" element={<VerifyAccount />} />
            <Route path="forgot-password" element={<ForgotPasswordScreen />} />

            {/* --- PROTECTED ROUTES - DRIVER & STAFF --- */}
            <Route element={<ProtectedRoute roles={['DRIVER', 'STAFF']} />}>
                {/* Driver & Staff Routes with NavBar */}
                <Route path="dashboard" element={
                    <DriverLayout>
                        <Dashboard />
                    </DriverLayout>
                } />
                <Route path="driver/profile/info" element={
                    <DriverLayout>
                        <UserProfileScreen tab="info" />
                    </DriverLayout>
                } />
                <Route path="driver/profile/vehicles" element={
                    <DriverLayout>
                        <UserProfileScreen tab="vehicles" />
                    </DriverLayout>
                } />
                <Route path="driver/profile/history" element={
                    <DriverLayout>
                        <UserProfileScreen tab="history" />
                    </DriverLayout>
                } />
                <Route path="payment" element={
                    <DriverLayout>
                        <PaymentPage />
                    </DriverLayout>
                } />
                <Route path="wallet" element={
                    <DriverLayout>
                        <WalletPage />
                    </DriverLayout>
                } />
                <Route path="stations/booking" element={
                    <DriverLayout>
                        <BookingPage />
                    </DriverLayout>
                } />
                <Route path="route-planning" element={
                    <DriverLayout>
                        <RoutePlanningPage />
                    </DriverLayout>
                } />
                <Route path="map" element={
                    <DriverLayout>
                        <FindStationPage />
                    </DriverLayout>
                } />
                <Route path="sessions/live" element={
                    <DriverLayout>
                        <ChargingLive />
                    </DriverLayout>
                } />
                <Route path="sessions/qr" element={
                    <DriverLayout>
                        <QRScanner />
                    </DriverLayout>
                } />
                <Route path="pricing" element={
                    <DriverLayout>
                        <PricingPage />
                    </DriverLayout>
                } />
                <Route path="notifications" element={
                    <DriverLayout>
                        <NotificationsPage />
                    </DriverLayout>
                } />
            </Route>

            {/* --- STAFF ONLY ROUTES --- */}
            <Route element={<ProtectedRoute requireStaff={true} />}>
                <Route path="staff/*" element={<StaffPage />} />
            </Route>

            {/* --- ADMIN ROUTES --- */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>
                <Route path="admin/*" element={<AdminPage />} />
            </Route>

            {/* --- 404 NOT FOUND --- */}
            <Route path="*" element={
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h2>404 - Trang không tồn tại</h2>
                    <p>Rất tiếc, trang bạn tìm kiếm không có ở đây.</p>
                    <a href="/" style={{ color: '#007bff', textDecoration: 'underline' }}>
                        Quay lại trang chủ
                    </a>
                </div>
            } />
        </Routes>
    );
}

export default AppRouter;