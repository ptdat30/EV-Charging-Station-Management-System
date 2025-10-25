// src/components/Common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Điều chỉnh đường dẫn

function ProtectedRoute() {
    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        // Nếu chưa đăng nhập, chuyển hướng về trang Login (route '/')
        console.log("Not logged in, redirecting to login..."); // Log để debug
        return <Navigate to="/" replace />; // replace=true thay thế lịch sử trình duyệt
    }

    // Nếu đã đăng nhập, hiển thị nội dung của route con
    return <Outlet />;
}

export default ProtectedRoute;