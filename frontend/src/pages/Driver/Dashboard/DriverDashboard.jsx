// src/pages/Driver/Dashboard/DriverDashboard.jsx
import React from 'react';
import { useAuth } from '../../../contexts/AuthContext'; // Điều chỉnh đường dẫn import

function DriverDashboard() {
    const { token } = useAuth(); // Ví dụ lấy token

    // TODO: Fetch dashboard specific data if needed

    return (
        <div>
            <h2>Driver Dashboard</h2>
            <p>Welcome! You are logged in.</p>
            {/* Hiển thị thông tin dashboard */}
        </div>
    );
}
export default DriverDashboard;