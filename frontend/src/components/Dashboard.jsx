// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Dữ liệu mẫu cho dashboard driver (sẽ được thay thế bằng API thực tế)
  const energyData = [
    { day: 'T2', usage: 45 },
    { day: 'T3', usage: 68 },
    { day: 'T4', usage: 52 },
    { day: 'T5', usage: 78 },
    { day: 'T6', usage: 95 },
    { day: 'T7', usage: 72 },
    { day: 'CN', usage: 60 }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="driver-dashboard">
      {/* Welcome Header */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1>Xin chào, {user?.fullName || user?.email || 'Driver'}! 👋</h1>
          <p>Chào mừng bạn đến với EVCharge Dashboard</p>
        </div>
      </div>

      {/* Driver Stats Cards */}
      <div className="kpi-grid">
        <Link to="/driver/profile/history" className="kpi-card glass driver-card">
          <div className="kpi-icon">
            <i className="fas fa-history"></i>
          </div>
          <div className="kpi-content">
            <h3>24</h3>
            <p>Tổng số phiên sạc</p>
            <span className="kpi-link">Xem lịch sử →</span>
          </div>
        </Link>

        <div className="kpi-card glass driver-card">
          <div className="kpi-icon">
            <i className="fas fa-bolt"></i>
          </div>
          <div className="kpi-content">
            <h3>1,245</h3>
            <p>kWh đã sạc (tháng này)</p>
            <span className="kpi-change up">+15% so với tháng trước</span>
          </div>
        </div>

        <Link to="/payment" className="kpi-card glass driver-card">
          <div className="kpi-icon">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="kpi-content">
            <h3>850,000</h3>
            <p>VNĐ trong ví</p>
            <span className="kpi-link">Nạp tiền →</span>
          </div>
        </Link>

        <div className="kpi-card glass driver-card">
          <div className="kpi-icon">
            <i className="fas fa-star"></i>
          </div>
          <div className="kpi-content">
            <h3>4.8</h3>
            <p>Đánh giá trung bình</p>
            <span className="kpi-change">Tuyệt vời!</span>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="charts-section">
        {/* Energy Usage Chart */}
        <div className="chart-dual glass">
          <div className="chart-header">
            <h3>Năng lượng đã sạc (7 ngày qua)</h3>
            <select className="chart-filter">
              <option>Tuần này</option>
              <option>Tuần trước</option>
              <option>Tháng này</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={energyData}>
              <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#666" />
              <YAxis stroke="#10b981" />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
              <Legend />
              <Line type="monotone" dataKey="usage" stroke="#10b981" strokeWidth={3} name="kWh" dot={{ fill: '#10b981', r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-driver glass">
          <div className="chart-header">
            <h3>Hành động nhanh</h3>
          </div>
          <div className="action-buttons-driver">
            <Link to="/map" className="action-btn-driver primary">
              <i className="fas fa-map-marker-alt"></i>
              <span>Tìm trạm sạc</span>
            </Link>
            <Link to="/stations/booking" className="action-btn-driver secondary">
              <i className="fas fa-calendar-check"></i>
              <span>Đặt chỗ sạc</span>
            </Link>
            <Link to="/driver/profile/history" className="action-btn-driver tertiary">
              <i className="fas fa-history"></i>
              <span>Lịch sử</span>
            </Link>
            <Link to="/payment" className="action-btn-driver quaternary">
              <i className="fas fa-wallet"></i>
              <span>Nạp ví</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Row - Recent Activity */}
      <div className="bottom-grid">
        {/* Recent Sessions */}
        <div className="recent-sessions glass">
          <div className="chart-header">
            <h3>Phiên sạc gần đây</h3>
            <Link to="/driver/profile/history" className="view-all">Xem tất cả →</Link>
          </div>
          <div className="sessions-list">
            <div className="session-item">
              <div className="session-icon"><i className="fas fa-charging-station"></i></div>
              <div className="session-info">
                <div className="session-name">Vincom Đồng Khởi</div>
                <div className="session-details">45 kWh • Hoàn thành</div>
              </div>
              <div className="session-date">Hôm nay</div>
            </div>
            <div className="session-item">
              <div className="session-icon"><i className="fas fa-charging-station"></i></div>
              <div className="session-info">
                <div className="session-name">Saigon Centre</div>
                <div className="session-details">52 kWh • Hoàn thành</div>
              </div>
              <div className="session-date">2 ngày trước</div>
            </div>
            <div className="session-item">
              <div className="session-icon"><i className="fas fa-charging-station"></i></div>
              <div className="session-info">
                <div className="session-name">Petrolimex Nguyễn Huệ</div>
                <div className="session-details">38 kWh • Hoàn thành</div>
              </div>
              <div className="session-date">5 ngày trước</div>
            </div>
          </div>
        </div>

        {/* Favorite Stations */}
        <div className="favorite-stations glass">
          <div className="chart-header">
            <h3>Trạm yêu thích</h3>
            <Link to="/map" className="view-all">Tìm thêm →</Link>
          </div>
          <div className="stations-list-driver">
            {[
              { name: 'Vincom Đồng Khởi', rating: 4.9, distance: '2.5 km' },
              { name: 'Saigon Centre', rating: 4.8, distance: '3.2 km' },
              { name: 'Petrolimex Nguyễn Huệ', rating: 4.7, distance: '5.1 km' }
            ].map((station, i) => (
              <div key={i} className="station-item-driver">
                <div className="station-icon-driver">
                  <i className="fas fa-star"></i>
                </div>
                <div className="station-info-driver">
                  <div className="station-name-driver">{station.name}</div>
                  <div className="station-metrics-driver">
                    <span><i className="fas fa-star"></i> {station.rating}</span>
                    <span><i className="fas fa-map-marker-alt"></i> {station.distance}</span>
                  </div>
                </div>
                <Link to="/map" className="station-action">
                  <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;