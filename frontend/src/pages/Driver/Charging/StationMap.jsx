// src/pages/Driver/Charging/StationMap.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Giả sử tạo service riêng cho station: import { getAllStations } from '../../../services/stationService';
import apiClient from '../../../services/api'; // Tạm dùng apiClient chung
import { useAuth } from '../../../contexts/AuthContext';

function StationMapPage() {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token, logout } = useAuth();

    useEffect(() => {
        const fetchStations = async () => {
            if (!token) return; // Cần token để gọi API này
            setLoading(true);
            setError(null);
            try {
                // Cập nhật token cho apiClient (cần cơ chế tốt hơn như interceptor)
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const response = await apiClient.get('/stations'); // Gọi API lấy danh sách trạm
                setStations(response.data);
            } catch (err) {
                console.error("Failed to fetch stations:", err);
                setError("Could not load stations.");
                if (err.response?.status === 401 || err.response?.status === 403) {
                    logout(); // Logout nếu token không hợp lệ
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStations();
    }, [token, logout]); // Chạy lại khi token thay đổi

    if (loading) return <p>Loading stations...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Available Charging Stations</h2>
            {stations.length === 0 ? (
                <p>No stations found.</p>
            ) : (
                <ul>
                    {stations.map((station) => (
                        <li key={station.stationId}>
                            <Link to={`/station/${station.stationId}`}>
                                {station.stationName} ({station.stationCode}) - Status: {station.status}
                            </Link>
                            {/* Hiển thị thêm thông tin cơ bản nếu muốn */}
                        </li>
                    ))}
                </ul>
            )}
            {/* TODO: Tích hợp bản đồ */}
        </div>
    );
}
export default StationMapPage;