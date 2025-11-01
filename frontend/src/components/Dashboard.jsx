// src/components/Dashboard.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LazyEnergyChart } from './LazyChart';
import { getDashboardStats, getRecentSessions, getEnergyUsageChart } from '../services/dashboardService';
import { getBalance } from '../services/walletService';
import { getMyProfile } from '../services/userService';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [recentSessions, setRecentSessions] = useState([]);
  const [energyData, setEnergyData] = useState([]);
  const [driverName, setDriverName] = useState('');
  const [error, setError] = useState('');

  // Redirect staff to staff dashboard
  useEffect(() => {
    const userRole = (user?.role || user?.userType || '').toUpperCase();
    if (userRole === 'STAFF') {
      console.log('🔄 Staff detected in Dashboard, redirecting to /staff');
      navigate('/staff', { replace: true });
      return;
    }
    if (userRole === 'ADMIN') {
      console.log('🔄 Admin detected in Dashboard, redirecting to /admin');
      navigate('/admin', { replace: true });
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        // Load driver profile để lấy tên driver
        try {
          const profileRes = await getMyProfile();
          const fullName = profileRes?.data?.fullName;
          if (fullName) {
            // Xử lý tên: Loại bỏ khoảng trắng thừa và chuẩn hóa
            const cleanName = fullName.trim().replace(/\s+/g, ' ');
            setDriverName(cleanName);
          } else {
            // Fallback to user email hoặc username
            setDriverName(user?.fullName || user?.email?.split('@')[0] || 'Driver');
          }
        } catch (err) {
          console.warn('Could not load driver profile:', err);
          // Fallback
          setDriverName(user?.fullName || user?.email?.split('@')[0] || 'Driver');
        }
        
        // Load dashboard stats
        const statsData = await getDashboardStats();
        setStats(statsData);
        
        // Load wallet balance
        try {
          const balanceData = await getBalance();
          setWalletBalance(balanceData.balance || 0);
        } catch (err) {
          console.warn('Could not load wallet balance:', err);
        }
        
        // Load recent sessions
        const recentData = await getRecentSessions(5);
        setRecentSessions(Array.isArray(recentData) ? recentData : []);
        
        // Load energy usage chart
        const chartData = await getEnergyUsageChart('week');
        setEnergyData(Array.isArray(chartData) ? chartData : []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err.response?.data?.message || err.message || 'Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Memoize formatted stats để tránh re-calculate
  const formattedStats = useMemo(() => {
    if (!stats) return null;
    return {
      totalSessions: stats.totalSessions || 0,
      completedSessions: stats.completedSessions || 0,
      totalEnergyThisMonth: (stats.totalEnergyThisMonth || 0).toFixed(1),
      energyChangePercent: stats.energyChangePercent || 0
    };
  }, [stats]);

  // Memoize formatted balance
  const formattedBalance = useMemo(() => {
    return walletBalance.toLocaleString('vi-VN');
  }, [walletBalance]);

  // Memoize recent sessions với formatted data
  const formattedRecentSessions = useMemo(() => {
    return recentSessions.map(session => {
      const energy = session.energyConsumed || 0;
      const endTime = session.endTime ? new Date(session.endTime) : null;
      const timeAgo = endTime ? getTimeAgo(endTime) : 'N/A';
      
      return {
        ...session,
        formattedEnergy: energy.toFixed(1),
        timeAgo,
        statusLabel: session.sessionStatus === 'completed' ? 'Hoàn thành' : session.sessionStatus
      };
    });
  }, [recentSessions]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="driver-dashboard">
      {error && (
        <div className="dashboard-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Driver Stats Cards */}
      <div className="kpi-grid">
        <Link to="/driver/profile/history" className="kpi-card glass driver-card">
          <div className="kpi-icon">
            <i className="fas fa-history"></i>
          </div>
          <div className="kpi-content">
            <h3>{formattedStats?.totalSessions || 0}</h3>
            <p>Tổng số phiên sạc</p>
            <span className="kpi-link">Xem lịch sử →</span>
          </div>
        </Link>

        <div className="kpi-card glass driver-card">
          <div className="kpi-icon">
            <i className="fas fa-bolt"></i>
          </div>
          <div className="kpi-content">
            <h3>{formattedStats?.totalEnergyThisMonth || '0.0'}</h3>
            <p>kWh đã sạc (tháng này)</p>
            {formattedStats?.energyChangePercent !== undefined && formattedStats.energyChangePercent !== 0 && (
              <span className={`kpi-change ${formattedStats.energyChangePercent > 0 ? 'up' : 'down'}`}>
                {formattedStats.energyChangePercent > 0 ? '+' : ''}{formattedStats.energyChangePercent.toFixed(1)}% so với tháng trước
              </span>
            )}
          </div>
        </div>

        <Link to="/wallet" className="kpi-card glass driver-card">
          <div className="kpi-icon">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="kpi-content">
            <h3>{formattedBalance}</h3>
            <p>VNĐ trong ví</p>
            <span className="kpi-link">Nạp tiền →</span>
          </div>
        </Link>

        <div className="kpi-card glass driver-card">
          <div className="kpi-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="kpi-content">
            <h3>{formattedStats?.completedSessions || 0}</h3>
            <p>Phiên đã hoàn thành</p>
            <span className="kpi-change">Thành công!</span>
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
          <LazyEnergyChart data={energyData} />
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
              <span>Đặt lịch sạc</span>
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
            {formattedRecentSessions.length > 0 ? (
              formattedRecentSessions.map((session) => (
                <div key={session.sessionId} className="session-item">
                  <div className="session-icon"><i className="fas fa-charging-station"></i></div>
                  <div className="session-info">
                    <div className="session-name">Trạm ID {session.stationId}</div>
                    <div className="session-details">
                      {session.formattedEnergy} kWh • {session.statusLabel}
                    </div>
                  </div>
                  <div className="session-date">{session.timeAgo}</div>
                </div>
              ))
            ) : (
              <div className="sessions-empty">
                <p>Chưa có phiên sạc nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Favorite Stations */}
        <div className="favorite-stations glass">
          <div className="chart-header">
            <h3>Trạm yêu thích</h3>
            <Link to="/map" className="view-all">Tìm thêm →</Link>
          </div>
          <div className="stations-list-driver">
            <div className="stations-empty-driver">
              <p>Chưa có trạm yêu thích</p>
              <Link to="/map" className="view-all">Tìm trạm ngay →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

export default Dashboard;