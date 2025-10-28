// src/components/admin/DashboardContent.jsx
import React from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardContent = () => {
  const energyData = [
    { day: 'T2', kWh: 120 }, { day: 'T3', kWh: 180 }, { day: 'T4', kWh: 150 },
    { day: 'T5', kWh: 220 }, { day: 'T6', kWh: 280 }, { day: 'T7', kWh: 190 }, { day: 'CN', kWh: 160 }
  ];

  const statusData = [
    { name: 'Hoạt động', value: 68, color: '#10b981' },
    { name: 'Đang sạc', value: 25, color: '#3b82f6' },
    { name: 'Bảo trì', value: 7, color: '#f59e0b' }
  ];

  return (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="stat-card">
          <i className="fas fa-charging-station"></i>
          <div>
            <h3>85</h3>
            <p>Trạm hoạt động</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fas fa-bolt"></i>
          <div>
            <h3>1.420 kWh</h3>
            <p>Hôm nay</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fas fa-users"></i>
          <div>
            <h3>342</h3>
            <p>Người dùng</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fas fa-coins"></i>
          <div>
            <h3>24.5 triệu</h3>
            <p>Doanh thu</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Năng lượng 7 ngày</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={energyData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="kWh" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Trạng thái trạm</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value">
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;