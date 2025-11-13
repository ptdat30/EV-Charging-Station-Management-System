// src/pages/DriverApp/Analytics/DriverAnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { getMyTransactionsHistory } from '../../../services/userService';
import { getMyPayments } from '../../../services/paymentService';
import './DriverAnalyticsPage.css';

const DriverAnalyticsPage = () => {
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState([]);
    const [payments, setPayments] = useState([]);
    const [timeRange, setTimeRange] = useState('month'); // month, quarter, year
    const [stats, setStats] = useState({
        totalCost: 0,
        totalEnergy: 0,
        totalSessions: 0,
        avgCostPerSession: 0,
        avgEnergyPerSession: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [sessionsResult, paymentsResult] = await Promise.all([
                getMyTransactionsHistory().catch(() => ({ data: [] })),
                getMyPayments(0, 500).catch(() => ({ content: [] }))
            ]);

            const sessionsList = Array.isArray(sessionsResult?.data) ? sessionsResult.data : [];
            const paymentsList = Array.isArray(paymentsResult?.content) ? paymentsResult.content : 
                               Array.isArray(paymentsResult?.data) ? paymentsResult.data : [];

            setSessions(sessionsList);
            setPayments(paymentsList);
            
            // Calculate statistics
            calculateStats(sessionsList, paymentsList);
        } catch (error) {
            console.error('Error loading analytics data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (sessionsList, paymentsList) => {
        const completedSessions = sessionsList.filter(s => 
            s.sessionStatus?.toLowerCase() === 'completed'
        );

        const totalEnergy = completedSessions.reduce((sum, s) => 
            sum + (parseFloat(s.energyConsumed) || 0), 0
        );

        const completedPayments = paymentsList.filter(p => 
            p.paymentStatus === 'completed'
        );

        const totalCost = completedPayments.reduce((sum, p) => 
            sum + (parseFloat(p.amount) || 0), 0
        );

        setStats({
            totalCost,
            totalEnergy,
            totalSessions: completedSessions.length,
            avgCostPerSession: completedSessions.length > 0 ? totalCost / completedSessions.length : 0,
            avgEnergyPerSession: completedSessions.length > 0 ? totalEnergy / completedSessions.length : 0
        });
    };

    // Báo cáo chi phí theo tháng
    const getMonthlyCostData = () => {
        const monthlyData = {};
        const now = new Date();
        const months = timeRange === 'year' ? 12 : timeRange === 'quarter' ? 3 : 6;

        // Initialize months
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyData[key] = {
                month: date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
                cost: 0,
                energy: 0,
                sessions: 0
            };
        }

        // Aggregate payments by month
        payments.forEach(payment => {
            if (payment.paymentStatus !== 'completed') return;
            const date = new Date(payment.paymentTime || payment.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (monthlyData[key]) {
                monthlyData[key].cost += parseFloat(payment.amount) || 0;
            }
        });

        // Aggregate sessions by month
        sessions.forEach(session => {
            if (session.sessionStatus?.toLowerCase() !== 'completed') return;
            const date = new Date(session.startTime);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (monthlyData[key]) {
                monthlyData[key].energy += parseFloat(session.energyConsumed) || 0;
                monthlyData[key].sessions += 1;
            }
        });

        return Object.values(monthlyData);
    };

    // Thống kê trạm sạc thường dùng
    const getTopStations = () => {
        const stationStats = {};

        sessions.forEach(session => {
            if (!session.stationId) return;
            const stationId = session.stationId;
            
            if (!stationStats[stationId]) {
                stationStats[stationId] = {
                    stationId,
                    name: `Trạm ${stationId}`,
                    sessions: 0,
                    energy: 0,
                    cost: 0
                };
            }

            stationStats[stationId].sessions += 1;
            stationStats[stationId].energy += parseFloat(session.energyConsumed) || 0;
        });

        // Add cost from payments
        payments.forEach(payment => {
            const session = sessions.find(s => s.sessionId === payment.sessionId);
            if (session && stationStats[session.stationId]) {
                stationStats[session.stationId].cost += parseFloat(payment.amount) || 0;
            }
        });

        return Object.values(stationStats)
            .sort((a, b) => b.sessions - a.sessions)
            .slice(0, 5);
    };

    // Thống kê theo giờ trong ngày
    const getHourlyUsageData = () => {
        const hourlyData = Array.from({ length: 24 }, (_, i) => ({
            hour: `${i}h`,
            sessions: 0,
            energy: 0
        }));

        sessions.forEach(session => {
            if (!session.startTime) return;
            const date = new Date(session.startTime);
            const hour = date.getHours();
            
            hourlyData[hour].sessions += 1;
            hourlyData[hour].energy += parseFloat(session.energyConsumed) || 0;
        });

        return hourlyData;
    };

    // Thống kê công suất sạc
    const getPowerDistribution = () => {
        const powerRanges = {
            'Thấp (<25kW)': 0,
            'Trung bình (25-50kW)': 0,
            'Cao (50-100kW)': 0,
            'Siêu cao (>100kW)': 0
        };

        sessions.forEach(session => {
            const energy = parseFloat(session.energyConsumed) || 0;
            const duration = session.startTime && session.endTime 
                ? (new Date(session.endTime) - new Date(session.startTime)) / 3600000 
                : 1;
            const avgPower = energy / duration;

            if (avgPower < 25) powerRanges['Thấp (<25kW)'] += 1;
            else if (avgPower < 50) powerRanges['Trung bình (25-50kW)'] += 1;
            else if (avgPower < 100) powerRanges['Cao (50-100kW)'] += 1;
            else powerRanges['Siêu cao (>100kW)'] += 1;
        });

        return Object.entries(powerRanges).map(([name, value]) => ({ name, value }));
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (loading) {
        return (
            <div className="analytics-loading">
                <div className="spinner"></div>
                <p>Đang tải dữ liệu phân tích...</p>
            </div>
        );
    }

    const monthlyCostData = getMonthlyCostData();
    const topStations = getTopStations();
    const hourlyUsageData = getHourlyUsageData();
    const powerDistribution = getPowerDistribution();

    return (
        <div className="driver-analytics-page">
            <div className="analytics-container">
                {/* Header */}
                <div className="analytics-header">
                    <div>
                        <h1>
                            <i className="fas fa-chart-line"></i>
                            Thống kê & Phân tích
                        </h1>
                        <p>Phân tích chi phí và thói quen sạc của bạn</p>
                    </div>
                    <div className="time-range-selector">
                        <button 
                            className={timeRange === 'month' ? 'active' : ''}
                            onClick={() => setTimeRange('month')}
                        >
                            6 tháng
                        </button>
                        <button 
                            className={timeRange === 'quarter' ? 'active' : ''}
                            onClick={() => setTimeRange('quarter')}
                        >
                            3 tháng
                        </button>
                        <button 
                            className={timeRange === 'year' ? 'active' : ''}
                            onClick={() => setTimeRange('year')}
                        >
                            12 tháng
                        </button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="analytics-summary">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <i className="fas fa-money-bill-wave"></i>
                        </div>
                        <div className="stat-info">
                            <div className="stat-label">Tổng chi phí</div>
                            <div className="stat-value">{new Intl.NumberFormat('vi-VN').format(stats.totalCost)} ₫</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                            <i className="fas fa-bolt"></i>
                        </div>
                        <div className="stat-info">
                            <div className="stat-label">Tổng năng lượng</div>
                            <div className="stat-value">{stats.totalEnergy.toFixed(2)} kWh</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                            <i className="fas fa-charging-station"></i>
                        </div>
                        <div className="stat-info">
                            <div className="stat-label">Tổng phiên sạc</div>
                            <div className="stat-value">{stats.totalSessions}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                            <i className="fas fa-calculator"></i>
                        </div>
                        <div className="stat-info">
                            <div className="stat-label">Chi phí TB/lần</div>
                            <div className="stat-value">{new Intl.NumberFormat('vi-VN').format(stats.avgCostPerSession)} ₫</div>
                        </div>
                    </div>
                </div>

                {/* Monthly Cost Report */}
                <div className="analytics-section">
                    <div className="section-header">
                        <h2>
                            <i className="fas fa-calendar-alt"></i>
                            Báo cáo chi phí theo tháng
                        </h2>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={monthlyCostData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip 
                                    formatter={(value, name) => {
                                        if (name === 'Chi phí') return [new Intl.NumberFormat('vi-VN').format(value) + ' ₫', name];
                                        if (name === 'Năng lượng') return [value.toFixed(2) + ' kWh', name];
                                        return [value, name];
                                    }}
                                />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="cost" stroke="#8884d8" strokeWidth={2} name="Chi phí" />
                                <Line yAxisId="right" type="monotone" dataKey="energy" stroke="#82ca9d" strokeWidth={2} name="Năng lượng" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="analytics-grid">
                    {/* Top Stations */}
                    <div className="analytics-section">
                        <div className="section-header">
                            <h2>
                                <i className="fas fa-map-marker-alt"></i>
                                Trạm sạc thường dùng
                            </h2>
                        </div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topStations}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="sessions" fill="#8884d8" name="Số lần sạc" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {topStations.length > 0 && (
                            <div className="station-list">
                                {topStations.map((station, index) => (
                                    <div key={station.stationId} className="station-item">
                                        <div className="station-rank">#{index + 1}</div>
                                        <div className="station-details">
                                            <div className="station-name">{station.name}</div>
                                            <div className="station-stats">
                                                {station.sessions} lần • {station.energy.toFixed(1)} kWh
                                            </div>
                                        </div>
                                        <div className="station-cost">
                                            {new Intl.NumberFormat('vi-VN').format(station.cost)} ₫
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Hourly Usage */}
                    <div className="analytics-section">
                        <div className="section-header">
                            <h2>
                                <i className="fas fa-clock"></i>
                                Thói quen sạc theo giờ
                            </h2>
                        </div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={hourlyUsageData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hour" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="sessions" fill="#82ca9d" name="Số lần sạc" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Power Distribution */}
                <div className="analytics-section">
                    <div className="section-header">
                        <h2>
                            <i className="fas fa-tachometer-alt"></i>
                            Phân bố công suất sạc
                        </h2>
                    </div>
                    <div className="chart-container center">
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={powerDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {powerDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Insights */}
                <div className="analytics-insights">
                    <h2>
                        <i className="fas fa-lightbulb"></i>
                        Nhận xét & Gợi ý
                    </h2>
                    <div className="insights-grid">
                        {stats.totalSessions > 0 && (
                            <>
                                <div className="insight-card">
                                    <div className="insight-icon">⚡</div>
                                    <div className="insight-content">
                                        <h3>Năng lượng trung bình</h3>
                                        <p>Bạn tiêu thụ trung bình <strong>{stats.avgEnergyPerSession.toFixed(2)} kWh</strong> mỗi lần sạc</p>
                                    </div>
                                </div>
                                <div className="insight-card">
                                    <div className="insight-icon">💰</div>
                                    <div className="insight-content">
                                        <h3>Chi phí trung bình</h3>
                                        <p>Chi phí trung bình <strong>{new Intl.NumberFormat('vi-VN').format(stats.avgCostPerSession)} ₫</strong> mỗi lần sạc</p>
                                    </div>
                                </div>
                                {hourlyUsageData.reduce((max, item) => item.sessions > max.sessions ? item : max, hourlyUsageData[0]).sessions > 0 && (
                                    <div className="insight-card">
                                        <div className="insight-icon">🕐</div>
                                        <div className="insight-content">
                                            <h3>Giờ sạc thường xuyên</h3>
                                            <p>Bạn thường sạc vào khung giờ <strong>{hourlyUsageData.reduce((max, item) => item.sessions > max.sessions ? item : max, hourlyUsageData[0]).hour}</strong></p>
                                        </div>
                                    </div>
                                )}
                                {topStations.length > 0 && (
                                    <div className="insight-card">
                                        <div className="insight-icon">📍</div>
                                        <div className="insight-content">
                                            <h3>Trạm yêu thích</h3>
                                            <p>Bạn thường sạc tại <strong>{topStations[0].name}</strong> ({topStations[0].sessions} lần)</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverAnalyticsPage;

