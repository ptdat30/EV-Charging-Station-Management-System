import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import '../styles/HomePageCharts.css';

const HomePageCharts = () => {
  // Dữ liệu năng lượng tiêu thụ theo ngày trong tuần
  const energyData = [
    { day: 'Thứ 2', kWh: 120, sessions: 45 },
    { day: 'Thứ 3', kWh: 180, sessions: 62 },
    { day: 'Thứ 4', kWh: 150, sessions: 58 },
    { day: 'Thứ 5', kWh: 220, sessions: 78 },
    { day: 'Thứ 6', kWh: 280, sessions: 95 },
    { day: 'Thứ 7', kWh: 190, sessions: 68 },
    { day: 'Chủ nhật', kWh: 160, sessions: 55 }
  ];

  // Dữ liệu trạng thái trạm sạc
  const stationStatusData = [
    { name: 'Hoạt động', value: 68, color: '#4CAF50' },
    { name: 'Đang sạc', value: 25, color: '#2196F3' },
    { name: 'Bảo trì', value: 7, color: '#FF9800' }
  ];

  // Dữ liệu loại sạc
  const chargerTypeData = [
    { name: 'AC', value: 55, color: '#4CAF50' },
    { name: 'DC', value: 45, color: '#2196F3' }
  ];

  // Thống kê tổng quan
  const stats = [
    { icon: 'fas fa-charging-station', value: '85', label: 'Trạm hoạt động', color: '#4CAF50' },
    { icon: 'fas fa-bolt', value: '1.420', label: 'kWh hôm nay', color: '#2196F3' },
    { icon: 'fas fa-users', value: '342', label: 'Người dùng', color: '#FF9800' },
    { icon: 'fas fa-plug', value: '1.240', label: 'Lượt sạc', color: '#9C27B0' }
  ];

  return (
    <section className="homepage-charts">
      <div className="charts-container">
        <h2 className="charts-title">Thống kê và Phân tích</h2>
        <p className="charts-subtitle">Theo dõi hiệu suất và xu hướng sử dụng hệ thống trạm sạc</p>

        {/* Stats Cards */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ color: stat.color }}>
                <i className={stat.icon}></i>
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Line Chart - Năng lượng tiêu thụ */}
          <div className="chart-card">
            <h3 className="chart-title">
              <i className="fas fa-chart-line"></i>
              Năng lượng tiêu thụ 7 ngày
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={energyData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="kWh" 
                  stroke="#4CAF50" 
                  strokeWidth={3}
                  name="Năng lượng (kWh)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Số lượt sạc */}
          <div className="chart-card">
            <h3 className="chart-title">
              <i className="fas fa-chart-bar"></i>
              Số lượt sạc theo ngày
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={energyData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sessions" fill="#2196F3" name="Số lượt sạc" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Charts Grid */}
        <div className="charts-grid">
          {/* Pie Chart - Trạng thái trạm */}
          <div className="chart-card">
            <h3 className="chart-title">
              <i className="fas fa-chart-pie"></i>
              Trạng thái trạm sạc
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stationStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Loại sạc */}
          <div className="chart-card">
            <h3 className="chart-title">
              <i className="fas fa-plug"></i>
              Phân bố loại sạc
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chargerTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chargerTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePageCharts;

