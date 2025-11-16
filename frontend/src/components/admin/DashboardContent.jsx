// src/components/admin/DashboardContent.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/AdminDashboard.css';
import { 
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { getAdminDashboardStats, getRecentActivities } from '../../services/adminService';

const DashboardContent = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStations: 0,
    activeStations: 0,
    totalUsers: 0,
    individualUsers: 0,
    businessUsers: 0,
    staffUsers: 0,
    todayRevenue: 0,
    todayEnergy: 0,
    totalSessions: 0,
    activeSessions: 0
  });
  const [energyData, setEnergyData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto refresh mỗi 30 giây
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardData, activities] = await Promise.all([
        getAdminDashboardStats(),
        getRecentActivities(5)
      ]);

      setStats(dashboardData.stats);
      setEnergyData(dashboardData.charts.energyData);
      setStatusData(dashboardData.charts.statusData);
      setRecentActivities(activities);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const StatCard = ({ icon, title, value, subtitle, color, trend }) => (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ background: `${color}15`, color }}>
        <i className={icon}></i>
      </div>
      <div className="stat-card-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
        {trend && (
          <div className={`stat-trend ${trend.type}`}>
            <i className={`fas fa-arrow-${trend.type === 'up' ? 'up' : 'down'}`}></i>
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (loading && stats.totalStations === 0) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchDashboardData}>
            <i className="fas fa-refresh"></i>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Page Header */}
      <div className="dashboard-header">
        <div>
          <h2>Bảng điều khiển</h2>
          <p>Tổng quan hệ thống EV Charge - Dữ liệu thời gian thực</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <i className={`fas fa-refresh ${loading ? 'fa-spin' : ''}`}></i>
            Làm mới
          </button>
          <button className="btn-primary">
            <i className="fas fa-download"></i>
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon="fas fa-charging-station"
          title="Tổng trạm sạc"
          value={stats.totalStations}
          subtitle={`${stats.activeStations} đang hoạt động`}
          color="#10b981"
        />
        <StatCard
          icon="fas fa-users"
          title="Tổng người dùng"
          value={stats.totalUsers.toLocaleString()}
          subtitle={`${stats.individualUsers} cá nhân, ${stats.businessUsers} doanh nghiệp, ${stats.staffUsers} nhân viên`}
          color="#3b82f6"
        />
        <StatCard
          icon="fas fa-coins"
          title="Doanh thu hôm nay"
          value={formatCurrency(stats.todayRevenue)}
          subtitle="Tổng giao dịch trong ngày"
          color="#f59e0b"
        />
        <StatCard
          icon="fas fa-bolt"
          title="Năng lượng hôm nay"
          value={`${stats.todayEnergy.toFixed(2)} kWh`}
          subtitle={`${stats.activeSessions} phiên đang sạc / ${stats.totalSessions} tổng phiên`}
          color="#ef4444"
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Energy Consumption Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Tiêu thụ năng lượng (7 ngày qua)</h3>
            <select className="chart-filter" defaultValue="week">
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
              <option value="quarter">3 tháng qua</option>
            </select>
          </div>
          {energyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={energyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => `${value} kWh`}
                />
                <Line 
                  type="monotone" 
                  dataKey="kWh" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">
              <i className="fas fa-chart-line"></i>
              <p>Chưa có dữ liệu</p>
            </div>
          )}
        </div>

        {/* Station Status Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Trạng thái trạm sạc</h3>
          </div>
          {statusData.length > 0 && statusData.some(s => s.value > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData.filter(s => s.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.filter(s => s.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {statusData.map((item, index) => (
                  <div key={index} className="legend-item">
                    <span className="legend-color" style={{ background: item.color }}></span>
                    <span>{item.name}: {item.value} {item.name === 'Đang sạc' ? 'phiên' : 'trạm'}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-data">
              <i className="fas fa-chart-pie"></i>
              <p>Chưa có dữ liệu</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="activities-card">
        <div className="card-header">
          <h3>Hoạt động gần đây</h3>
          <a href="#" className="view-all-link">Xem tất cả</a>
        </div>
        {recentActivities.length > 0 ? (
          <div className="activities-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon" style={{ 
                  background: activity.type === 'session' ? '#10b98115' : 
                             activity.type === 'user' ? '#3b82f615' :
                             activity.type === 'station' ? '#f59e0b15' : '#ef444415',
                  color: activity.type === 'session' ? '#10b981' : 
                         activity.type === 'user' ? '#3b82f6' :
                         activity.type === 'station' ? '#f59e0b' : '#ef4444'
                }}>
                  <i className={`fas ${activity.icon}`}></i>
                </div>
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <i className="fas fa-info-circle"></i>
            <p>Chưa có hoạt động nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardContent;
