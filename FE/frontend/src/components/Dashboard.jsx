// src/components/Dashboard.jsx
import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const energyData = [
    { day: 'T2', usage: 120, sessions: 45 },
    { day: 'T3', usage: 180, sessions: 68 },
    { day: 'T4', usage: 150, sessions: 52 },
    { day: 'T5', usage: 220, sessions: 78 },
    { day: 'T6', usage: 280, sessions: 95 },
    { day: 'T7', usage: 190, sessions: 72 },
    { day: 'CN', usage: 160, sessions: 60 }
  ];

  const stationStatus = [
    { name: 'Hoạt động', value: 68, color: '#10b981' },
    { name: 'Đang sạc', value: 25, color: '#3b82f6' },
    { name: 'Bảo trì', value: 7, color: '#f59e0b' }
  ];

  const revenueData = [
    { month: 'Th1', revenue: 4.5 },
    { month: 'Th2', revenue: 5.2 },
    { month: 'Th3', revenue: 6.8 },
    { month: 'Th4', revenue: 7.2 },
    { month: 'Th5', revenue: 8.9 },
    { month: 'Th6', revenue: 9.5 }
  ];

  const topStations = [
    { name: 'Vincom Đồng Khởi', usage: 285, revenue: 12.4 },
    { name: 'Saigon Centre', usage: 242, revenue: 10.8 },
    { name: 'Petrolimex Nguyễn Huệ', usage: 198, revenue: 8.9 },
    { name: 'Lotte Mart Q7', usage: 175, revenue: 7.6 }
  ];

  return (
    <div className="dashboard-pro">
      {/* Hero Header */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1>Bảng Điều Khiển Trạm Sạc EV</h1>
          <p>Quản lý thông minh - Tối ưu hiệu suất - Tăng trưởng bền vững</p>
          <div className="hero-stats">
            <span><i className="fas fa-bolt"></i> 1.420 kWh hôm nay</span>
            <span><i className="fas fa-users"></i> 342 người dùng</span>
          </div>
        </div>
        <div className="hero-bg"></div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card glass">
          <div className="kpi-icon">
            <i className="fas fa-charging-station"></i>
          </div>
          <div className="kpi-content">
            <h3>85</h3>
            <p>Trạm hoạt động</p>
            <span className="kpi-change up">+12%</span>
          </div>
        </div>

        <div className="kpi-card glass">
          <div className="kpi-icon">
            <i className="fas fa-coins"></i>
          </div>
          <div className="kpi-content">
            <h3>24.5 triệu</h3>
            <p>Doanh thu tháng</p>
            <span className="kpi-change up">+18%</span>
          </div>
        </div>

        <div className="kpi-card glass">
          <div className="kpi-icon">
            <i className="fas fa-battery-full"></i>
          </div>
          <div className="kpi-content">
            <h3>98.2%</h3>
            <p>Hiệu suất trung bình</p>
            <span className="kpi-change up">+2.1%</span>
          </div>
        </div>

        <div className="kpi-card glass">
          <div className="kpi-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="kpi-content">
            <h3>4.2 phút</h3>
            <p>Thời gian chờ trung bình</p>
            <span className="kpi-change down">-0.8 phút</span>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="charts-section">
        {/* Energy + Sessions */}
        <div className="chart-dual glass">
          <div className="chart-header">
            <h3>Năng lượng & Phiên sạc (7 ngày)</h3>
            <select className="chart-filter">
              <option>Tuần này</option>
              <option>Tuần trước</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={energyData}>
              <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#666" />
              <YAxis yAxisId="left" stroke="#10b981" />
              <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="usage" stroke="#10b981" strokeWidth={3} name="Năng lượng (kWh)" dot={{ fill: '#10b981', r: 6 }} />
              <Line yAxisId="right" type="monotone" dataKey="sessions" stroke="#3b82f6" strokeWidth={3} name="Phiên sạc" dot={{ fill: '#3b82f6', r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Station Status */}
        <div className="chart-pie glass">
          <div className="chart-header">
            <h3>Trạng thái trạm sạc</h3>
            <div className="pie-total">85 trạm</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stationStatus}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
              >
                {stationStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend-pro">
            {stationStatus.map((item) => (
              <div key={item.name} className="legend-item-pro">
                <div className="legend-dot" style={{ backgroundColor: item.color }}></div>
                <span>{item.name}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bottom-grid">
        {/* Revenue */}
        <div className="chart-bar glass">
          <div className="chart-header">
            <h3>Doanh thu 6 tháng</h3>
            <span className="chart-total">57.1 triệu VNĐ</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${value} triệu`} />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Stations */}
        <div className="top-stations glass">
          <div className="chart-header">
            <h3>Trạm hiệu suất cao</h3>
            <button className="view-all">Xem tất cả</button>
          </div>
          <div className="stations-list">
            {topStations.map((station, i) => (
              <div key={i} className="station-rank">
                <div className="rank-badge">#{i + 1}</div>
                <div className="station-name">{station.name}</div>
                <div className="station-metrics">
                  <span>{station.usage} kWh</span>
                  <span className="revenue">{station.revenue} triệu</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions glass">
          <h3>Hành động nhanh</h3>
          <div className="action-buttons">
            <button className="action-btn primary">
              <i className="fas fa-plus"></i> Thêm trạm mới
            </button>
            <button className="action-btn secondary">
              <i className="fas fa-file-export"></i> Xuất báo cáo
            </button>
            <button className="action-btn tertiary">
              <i className="fas fa-bell"></i> Cảnh báo hệ thống
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;