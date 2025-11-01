// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requireAdmin = false, requireStaff = false, roles = null }) => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();

    // Hiển thị loading khi đang xác thực
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #3498db',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color: '#666', fontSize: '16px' }}>Đang tải...</p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // Kiểm tra đăng nhập
    if (!isAuthenticated) {
        // Luôn redirect về homepage khi không authenticated (kể cả khi logout)
        // Thay vì redirect về login để user có thể thấy homepage và quyết định đăng nhập lại
        return <Navigate to="/" replace />;
    }

    // Lấy role của user (hỗ trợ nhiều format)
    // Backend trả về role dạng lowercase, cần uppercase để so sánh
    // Có thể là user.role hoặc user.userType
    const rawRole = user?.role || user?.userType || user?.roles?.[0] || '';
    const userRole = String(rawRole).toUpperCase();
    console.log('🔍 ProtectedRoute - Raw role:', rawRole, 'User role (uppercase):', userRole, 'Full user object:', user);

    // Kiểm tra quyền Admin (nếu route yêu cầu)
    if (requireAdmin) {
        if (userRole !== 'ADMIN') {
            return (
                <Navigate
                    to="/dashboard"
                    state={{
                        error: 'Bạn không có quyền truy cập trang Admin. Chỉ Admin mới được truy cập.',
                        from: location
                    }}
                    replace
                />
            );
        }
    }

    // Kiểm tra quyền Staff (nếu route yêu cầu)
    if (requireStaff) {
        console.log('🔒 Checking staff access. User role:', userRole);
        if (userRole !== 'STAFF' && userRole !== 'ADMIN') {
            console.log('❌ Access denied. Redirecting...');
            return (
                <Navigate
                    to="/dashboard"
                    state={{
                        error: 'Bạn không có quyền truy cập trang Staff.',
                        from: location
                    }}
                    replace
                />
            );
        }
        console.log('✅ Staff access granted');
    }

    // Kiểm tra roles cụ thể
    if (roles && Array.isArray(roles) && roles.length > 0) {
        const allowedRoles = roles.map(r => r.toUpperCase());
        if (!allowedRoles.includes(userRole)) {
            // Driver không có quyền -> redirect về dashboard
            if (userRole === 'DRIVER') {
                return (
                    <Navigate
                        to="/dashboard"
                        state={{
                            error: `Chỉ ${roles.join(', ')} mới được truy cập trang này.`,
                            from: location
                        }}
                        replace
                    />
                );
            }
            return (
                <Navigate
                    to="/"
                    state={{
                        error: `Bạn không có quyền truy cập. Yêu cầu: ${roles.join(', ')}`,
                        from: location
                    }}
                    replace
                />
            );
        }
    }

    // Render các route con
    return <Outlet />;
};

export default ProtectedRoute;