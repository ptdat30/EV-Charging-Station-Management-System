// src/routes.jsx
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';

// Pages
import LoginPage from './pages/Auth/Login';
import RegisterPage from './pages/Auth/Register';
import DriverDashboard from './pages/Driver/Dashboard/DriverDashboard';
import StationMapPage from './pages/Driver/Charging/StationMap';
import StationDetailPage from './pages/Driver/Charging/StationDetail';
import ChargingSessionPage from './pages/Driver/Charging/ChargingSession';

// Protected Route Component
import ProtectedRoute from './components/Common/ProtectedRoute'; // Import ProtectedRoute

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            // --- Public Routes ---
            { index: true, element: <LoginPage /> },
            { path: 'register', element: <RegisterPage /> },

            // --- Protected Routes ---
            // Element cha là ProtectedRoute, các route con chỉ hiển thị nếu đã đăng nhập
            {
                element: <ProtectedRoute />, // Bọc các route cần bảo vệ
                children: [
                    { path: 'dashboard', element: <DriverDashboard /> },
                    { path: 'stations', element: <StationMapPage /> },
                    { path: 'station/:stationId', element: <StationDetailPage /> },
                    { path: 'charging', element: <ChargingSessionPage /> },
                    // Thêm các route cần bảo vệ khác vào đây
                ],
            },
        ],
    },
    // Route 404 (ví dụ)
    // { path: "*", element: <NotFoundPage /> }
]);

export function AppRoutes() {
    return <RouterProvider router={router} />;
}