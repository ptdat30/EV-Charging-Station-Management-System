import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        // Nếu chưa đăng nhập, chuyển hướng về trang login
        return <Navigate to="/login" replace />;
    }

    // Nếu đã đăng nhập, cho phép truy cập vào trang con (component con)
    return <Outlet />;
};

export default ProtectedRoute;