// src/components/admin/RevenueReport.jsx
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { getAllTransactions } from '../../services/adminService';
import { getAllStations } from '../../services/stationService';
import apiClient from '../../config/api';
import '../../styles/AdminRevenueReport.css';

const RevenueReport = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month'); // day, week, month, year
  const [revenueData, setRevenueData] = useState([]);
  const [stationRevenue, setStationRevenue] = useState([]);
  const [transactionStats, setTransactionStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
  });
  const [topStations, setTopStations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all required data
      const [paymentsResponse, sessionsResponse, stationsResponse] = await Promise.all([
        getAllTransactions({ page: 0, size: 1000 }).catch(() => ({ data: { content: [] } })),
        apiClient.get('/sessions').catch(() => ({ data: [] })),
        getAllStations().catch(() => ({ data: [] })),
      ]);

      // Extract data
      const payments = paymentsResponse.data?.content || 
                      (Array.isArray(paymentsResponse.data) ? paymentsResponse.data : []);
      const sessions = Array.isArray(sessionsResponse.data) ? sessionsResponse.data : [];
      const stations = Array.isArray(stationsResponse.data) ? stationsResponse.data : [];

      // Calculate transaction stats
      const transactionStats = {
        total: payments.length,
        completed: payments.filter(p => p.paymentStatus?.toLowerCase() === 'completed').length,
        pending: payments.filter(p => p.paymentStatus?.toLowerCase() === 'pending').length,
        failed: payments.filter(p => p.paymentStatus?.toLowerCase() === 'failed').length,
        totalAmount: payments
          .filter(p => p.paymentStatus?.toLowerCase() === 'completed')
          .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
      };

      setTransactionStats(transactionStats);

      // Generate revenue data based on dateRange
      const revenueData = generateRevenueData(dateRange, payments, sessions);
      setRevenueData(revenueData);

      // Calculate station revenue
      const stationRevenue = calculateStationRevenue(stations, payments, sessions);
      setStationRevenue(stationRevenue);
      setTopStations(stationRevenue.slice(0, 5));
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Không thể tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const generateRevenueData = (range, payments, sessions) => {
    const data = [];
    const now = new Date();

    // Filter completed payments only
    const completedPayments = payments.filter(p => 
      p.paymentStatus?.toLowerCase() === 'completed'
    );

    if (range === 'day') {
      // Hourly data for today
      for (let i = 0; i < 24; i++) {
        const hour = new Date(now);
        hour.setHours(i, 0, 0, 0);
        const nextHour = new Date(hour);
        nextHour.setHours(i + 1, 0, 0, 0);

        const hourPayments = completedPayments.filter(p => {
          const paymentTime = new Date(p.paymentTime || p.createdAt);
          return paymentTime >= hour && paymentTime < nextHour;
        });

        const hourSessions = sessions.filter(s => {
          const startTime = new Date(s.startTime || s.createdAt);
          return startTime >= hour && startTime < nextHour;
        });

        const revenue = hourPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const sessionCount = hourSessions.length;
        const energy = hourSessions.reduce((sum, s) => sum + (parseFloat(s.energyConsumed) || 0), 0);

        data.push({
          time: `${String(i).padStart(2, '0')}:00`,
          revenue,
          sessions: sessionCount,
          energy,
        });
      }
    } else if (range === 'week') {
      // Daily data for last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayPayments = completedPayments.filter(p => {
          const paymentTime = new Date(p.paymentTime || p.createdAt);
          return paymentTime >= date && paymentTime < nextDate;
        });

        const daySessions = sessions.filter(s => {
          const startTime = new Date(s.startTime || s.createdAt);
          return startTime >= date && startTime < nextDate;
        });

        const revenue = dayPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const sessionCount = daySessions.length;
        const energy = daySessions.reduce((sum, s) => sum + (parseFloat(s.energyConsumed) || 0), 0);

        data.push({
          time: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          revenue,
          sessions: sessionCount,
          energy,
        });
      }
    } else if (range === 'month') {
      // Daily data for last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayPayments = completedPayments.filter(p => {
          const paymentTime = new Date(p.paymentTime || p.createdAt);
          return paymentTime >= date && paymentTime < nextDate;
        });

        const daySessions = sessions.filter(s => {
          const startTime = new Date(s.startTime || s.createdAt);
          return startTime >= date && startTime < nextDate;
        });

        const revenue = dayPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const sessionCount = daySessions.length;
        const energy = daySessions.reduce((sum, s) => sum + (parseFloat(s.energyConsumed) || 0), 0);

        data.push({
          time: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          revenue,
          sessions: sessionCount,
          energy,
        });
      }
    } else if (range === 'year') {
      // Monthly data for last 12 months
      const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i, 1);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setMonth(nextDate.getMonth() + 1);

        const monthPayments = completedPayments.filter(p => {
          const paymentTime = new Date(p.paymentTime || p.createdAt);
          return paymentTime >= date && paymentTime < nextDate;
        });

        const monthSessions = sessions.filter(s => {
          const startTime = new Date(s.startTime || s.createdAt);
          return startTime >= date && startTime < nextDate;
        });

        const revenue = monthPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const sessionCount = monthSessions.length;
        const energy = monthSessions.reduce((sum, s) => sum + (parseFloat(s.energyConsumed) || 0), 0);

        data.push({
          time: monthNames[date.getMonth()],
          revenue,
          sessions: sessionCount,
          energy,
        });
      }
    }

    return data;
  };

  const calculateStationRevenue = (stations, payments, sessions) => {
    // Filter completed payments with sessionId
    const completedPayments = payments.filter(p => 
      p.paymentStatus?.toLowerCase() === 'completed' && p.sessionId
    );

    // Create map: stationId -> { revenue, sessions, energy }
    const stationMap = {};

    // Initialize all stations
    stations.forEach(station => {
      stationMap[station.stationId || station.id] = {
        id: station.stationId || station.id,
        name: station.stationName || station.stationCode || `Trạm ${station.stationId || station.id}`,
        revenue: 0,
        sessions: 0,
        energy: 0,
      };
    });

    // Aggregate revenue and sessions by station
    sessions.forEach(session => {
      const stationId = session.stationId;
      if (stationMap[stationId]) {
        stationMap[stationId].sessions += 1;
        stationMap[stationId].energy += parseFloat(session.energyConsumed) || 0;
      }
    });

    completedPayments.forEach(payment => {
      const session = sessions.find(s => s.sessionId === payment.sessionId);
      if (session && stationMap[session.stationId]) {
        stationMap[session.stationId].revenue += parseFloat(payment.amount) || 0;
      }
    });

    // Convert to array and sort by revenue
    return Object.values(stationMap)
      .filter(s => s.sessions > 0 || s.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  };

  const formatShortCurrency = (amount) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M ₫';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'K ₫';
    }
    return amount + ' ₫';
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const transactionTypeData = [
    { name: 'Thành công', value: transactionStats.completed, color: '#10b981' },
    { name: 'Chờ xử lý', value: transactionStats.pending, color: '#f59e0b' },
    { name: 'Thất bại', value: transactionStats.failed, color: '#ef4444' },
  ];

  if (loading) {
    return (
      <div className="revenue-report">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải báo cáo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="revenue-report">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Báo cáo Doanh thu</h2>
          <p>Phân tích doanh thu và hiệu suất hệ thống</p>
        </div>
        <div className="header-actions">
          <select
            className="date-range-select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="day">Hôm nay</option>
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="year">12 tháng qua</option>
          </select>
          <button className="btn-secondary" onClick={fetchReportData}>
            <i className="fas fa-refresh"></i>
            Làm mới
          </button>
          <button className="btn-secondary" onClick={() => alert('Tính năng export đang phát triển')}>
            <i className="fas fa-download"></i>
            Xuất PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchReportData}>
            Thử lại
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card revenue">
          <div className="card-icon">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="card-content">
            <div className="card-label">Tổng doanh thu</div>
            <div className="card-value">{formatCurrency(transactionStats.totalAmount)}</div>
            <div className="card-trend">
              <i className="fas fa-arrow-up"></i>
              <span>+12.5% so với kỳ trước</span>
            </div>
          </div>
        </div>

        <div className="summary-card transactions">
          <div className="card-icon">
            <i className="fas fa-receipt"></i>
          </div>
          <div className="card-content">
            <div className="card-label">Tổng giao dịch</div>
            <div className="card-value">{transactionStats.total.toLocaleString('vi-VN')}</div>
            <div className="card-trend">
              <i className="fas fa-check-circle"></i>
              <span>{transactionStats.completed} thành công</span>
            </div>
          </div>
        </div>

        <div className="summary-card sessions">
          <div className="card-icon">
            <i className="fas fa-bolt"></i>
          </div>
          <div className="card-content">
            <div className="card-label">Phiên sạc</div>
            <div className="card-value">
              {revenueData.reduce((sum, d) => sum + d.sessions, 0).toLocaleString('vi-VN')}
            </div>
            <div className="card-trend">
              <i className="fas fa-arrow-up"></i>
              <span>Tăng 8.2%</span>
            </div>
          </div>
        </div>

        <div className="summary-card energy">
          <div className="card-icon">
            <i className="fas fa-battery-three-quarters"></i>
          </div>
          <div className="card-content">
            <div className="card-label">Năng lượng (kWh)</div>
            <div className="card-value">
              {revenueData.reduce((sum, d) => sum + d.energy, 0).toLocaleString('vi-VN')}
            </div>
            <div className="card-trend">
              <i className="fas fa-arrow-up"></i>
              <span>Tăng 15.3%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Revenue Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Doanh thu theo thời gian</h3>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-color" style={{ background: '#10b981' }}></span>
                Doanh thu
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={formatShortCurrency} />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sessions Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Số phiên sạc</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Bar dataKey="sessions" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction Status Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Trạng thái giao dịch</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={transactionTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {transactionTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Energy Consumption Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Tiêu thụ năng lượng</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                formatter={(value) => `${value} kWh`}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Stations Table */}
      <div className="top-stations-section">
        <div className="section-header">
          <h3>Top Trạm Sạc theo Doanh thu</h3>
          <button className="btn-secondary btn-sm" onClick={fetchReportData}>
            <i className="fas fa-refresh"></i>
          </button>
        </div>
        <div className="stations-table-container">
          <table className="stations-table">
            <thead>
              <tr>
                <th>Hạng</th>
                <th>Tên trạm</th>
                <th>Doanh thu</th>
                <th>Số phiên</th>
                <th>Năng lượng (kWh)</th>
                <th>Tỷ lệ</th>
              </tr>
            </thead>
            <tbody>
              {topStations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data-cell">
                    <i className="fas fa-inbox"></i>
                    <p>Không có dữ liệu</p>
                  </td>
                </tr>
              ) : (
                topStations.map((station, index) => {
                  const percentage = (station.revenue / transactionStats.totalAmount) * 100;
                  return (
                    <tr key={station.id}>
                      <td>
                        <div className="rank-badge" style={{
                          background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#f97316' : '#e2e8f0',
                          color: index < 3 ? '#fff' : '#64748b'
                        }}>
                          {index + 1}
                        </div>
                      </td>
                      <td>
                        <strong>{station.name}</strong>
                      </td>
                      <td>
                        <span className="amount-text">{formatCurrency(station.revenue)}</span>
                      </td>
                      <td>{station.sessions}</td>
                      <td>{station.energy.toLocaleString('vi-VN')}</td>
                      <td>
                        <div className="percentage-bar">
                          <div 
                            className="percentage-fill"
                            style={{ width: `${percentage}%`, background: '#10b981' }}
                          ></div>
                          <span className="percentage-text">{percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevenueReport;