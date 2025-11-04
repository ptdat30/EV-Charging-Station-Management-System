// src/components/staff/StaffDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllStations } from '../../services/stationService';
import apiClient from '../../config/api';
import '../../styles/StaffDashboard.css';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState([]);
  const [sessions, setSessions] = useState([]);
  
  // Emergency alerts & notifications
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  
  // KPI stats
  const [kpiStats, setKpiStats] = useState({
    todaySessions: 0,
    yesterdaySessions: 0,
    todayRevenue: 0,
    yesterdayRevenue: 0,
    utilizationRate: 0,
    avgChargingTime: 0,
  });
  
  // To-do items
  const [todoItems, setTodoItems] = useState({
    pendingSupportRequests: 0,
    pendingIncidents: 0,
  });

  useEffect(() => {
    console.log('🏢 StaffDashboard mounted');
    fetchDashboardData();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching dashboard data...');
      
      let stationsList = [];
      let sessionsList = [];

      // Fetch stations (for detecting offline stations)
      try {
        const stationsData = await getAllStations();
        stationsList = Array.isArray(stationsData) ? stationsData : (Array.isArray(stationsData?.data) ? stationsData.data : []);
        console.log('✅ Stations loaded:', stationsList.length);
      } catch (err) {
        console.error('❌ Error fetching stations:', err);
        stationsList = [];
      }

      // Fetch sessions for KPI calculations
      try {
        const sessionsResponse = await apiClient.get('/sessions');
        sessionsList = Array.isArray(sessionsResponse.data) ? sessionsResponse.data : [];
        console.log('✅ Sessions loaded:', sessionsList.length);
      } catch (err) {
        console.error('❌ Error fetching sessions:', err);
        sessionsList = [];
      }

      setStations(stationsList);
      setSessions(sessionsList);

      // Calculate emergency alerts
      const alerts = calculateEmergencyAlerts(stationsList, sessionsList);
      
      // Calculate KPI stats (need stations for utilization rate)
      calculateKPIStats(sessionsList, stationsList);
      
      // Calculate to-do items (pass alerts for incident count)
      calculateTodoItems(sessionsList, alerts);
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate emergency alerts from stations and sessions
  const calculateEmergencyAlerts = (stationsList, sessionsList) => {
    const alerts = [];
    
    // 1. Technical issues - offline stations
    stationsList.forEach(station => {
      const stationChargers = station.chargers || [];
      const offlineChargers = stationChargers.filter(c => 
        c.status?.toLowerCase() === 'offline' || c.status?.toLowerCase() === 'maintenance'
      );
      
      if (offlineChargers.length > 0) {
        alerts.push({
          id: `station-${station.stationId || station.id}`,
          type: 'technical',
          priority: 'CAO',
          title: `Trạm ${station.stationName || station.stationCode} có ${offlineChargers.length} điểm sạc ngừng hoạt động`,
          message: `${offlineChargers.length} điểm sạc đang offline hoặc bảo trì`,
          timestamp: new Date(),
          stationId: station.stationId || station.id,
          stationName: station.stationName || station.stationCode,
        });
      }
    });
    
    // 2. Failed charging sessions (potential emergency)
    const failedSessions = sessionsList.filter(s => 
      s.sessionStatus?.toLowerCase() === 'failed' || s.sessionStatus?.toLowerCase() === 'timeout'
    );
    
    if (failedSessions.length > 0) {
      alerts.push({
        id: 'failed-sessions',
        type: 'technical',
        priority: 'TRUNG BÌNH',
        title: `${failedSessions.length} phiên sạc thất bại`,
        message: 'Cần kiểm tra và xử lý các phiên sạc bị lỗi',
        timestamp: new Date(),
      });
    }
    
    // Mock: Safety incidents (would come from monitoring system)
    alerts.push({
      id: 'safety-1',
      type: 'safety',
      priority: 'CAO',
      title: 'Cảnh báo: Phát hiện nhiệt độ cao tại Trạm A01',
      message: 'Nhiệt độ điểm sạc #3 vượt ngưỡng an toàn',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      stationId: 1,
      chargerId: 3,
    });
    
    // Mock: Emergency support requests
    const urgentSessions = sessionsList.filter(s => {
      const startTime = s.startTime ? new Date(s.startTime) : null;
      if (!startTime) return false;
      const duration = Date.now() - startTime.getTime();
      // Sessions longer than 3 hours might need attention
      return duration > 3 * 60 * 60 * 1000 && (s.sessionStatus?.toLowerCase() === 'charging');
    });
    
    if (urgentSessions.length > 0) {
      alerts.push({
        id: 'long-sessions',
        type: 'support',
        priority: 'TRUNG BÌNH',
        title: `${urgentSessions.length} phiên sạc kéo dài bất thường`,
        message: 'Các phiên sạc đã vượt quá 3 giờ, cần kiểm tra',
        timestamp: new Date(),
      });
    }
    
    // Sort by priority (CAO first)
    const priorityOrder = { 'CAO': 0, 'TRUNG BÌNH': 1, 'THẤP': 2 };
    alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    setEmergencyAlerts(alerts);
    return alerts; // Return for use in calculateTodoItems
  };

  // Calculate KPI stats from sessions
  const calculateKPIStats = (sessionsList, stationsList = []) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Filter sessions by date
    const todaySessions = sessionsList.filter(s => {
      if (!s.startTime) return false;
      const sessionDate = new Date(s.startTime);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });
    
    const yesterdaySessions = sessionsList.filter(s => {
      if (!s.startTime) return false;
      const sessionDate = new Date(s.startTime);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === yesterday.getTime();
    });
    
    // Calculate today's revenue (assuming 3000 VND per kWh)
    const todayRevenue = todaySessions.reduce((sum, s) => {
      const energy = parseFloat(s.energyConsumed || 0);
      return sum + (energy * 3000);
    }, 0);
    
    const yesterdayRevenue = yesterdaySessions.reduce((sum, s) => {
      const energy = parseFloat(s.energyConsumed || 0);
      return sum + (energy * 3000);
    }, 0);
    
    // Calculate utilization rate (active sessions / total chargers)
    const activeSessions = sessionsList.filter(s => 
      s.sessionStatus?.toLowerCase() === 'charging' || s.sessionStatus?.toLowerCase() === 'active'
    ).length;
    
    // Get total chargers from stations
    const totalChargers = stationsList.reduce((sum, s) => sum + (s.chargers?.length || 0), 0);
    const utilizationRate = totalChargers > 0 ? (activeSessions / totalChargers) * 100 : 0;
    
    // Calculate average charging time (completed sessions only)
    const completedSessions = sessionsList.filter(s => {
      return s.sessionStatus?.toLowerCase() === 'completed' && 
             s.startTime && s.endTime;
    });
    
    let avgChargingTime = 0;
    if (completedSessions.length > 0) {
      const totalMinutes = completedSessions.reduce((sum, s) => {
        const start = new Date(s.startTime);
        const end = new Date(s.endTime);
        const minutes = (end - start) / (1000 * 60);
        return sum + minutes;
      }, 0);
      avgChargingTime = Math.round(totalMinutes / completedSessions.length);
    }
    
    setKpiStats({
      todaySessions: todaySessions.length,
      yesterdaySessions: yesterdaySessions.length,
      todayRevenue: todayRevenue,
      yesterdayRevenue: yesterdayRevenue,
      utilizationRate: utilizationRate,
      avgChargingTime: avgChargingTime,
    });
  };

  // Calculate to-do items
  const calculateTodoItems = (sessionsList, alertsList = []) => {
    // Pending support requests (sessions with issues)
    const pendingSupport = sessionsList.filter(s => {
      return s.sessionStatus?.toLowerCase() === 'failed' || 
             s.sessionStatus?.toLowerCase() === 'timeout' ||
             (s.startTime && (Date.now() - new Date(s.startTime).getTime()) > 3 * 60 * 60 * 1000 && 
              s.sessionStatus?.toLowerCase() === 'charging');
    }).length;
    
    // Pending incidents (count technical and safety alerts)
    const pendingIncidents = alertsList.filter(a => 
      a.type === 'technical' || a.type === 'safety'
    ).length;
    
    setTodoItems({
      pendingSupportRequests: pendingSupport,
      pendingIncidents: pendingIncidents || 0,
    });
  };

  // Recalculate to-do when alerts change
  useEffect(() => {
    if (sessions.length > 0) {
      calculateTodoItems(sessions, emergencyAlerts);
    }
  }, [emergencyAlerts, sessions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'CAO':
        return { color: '#ef4444', bg: '#fee2e2' };
      case 'TRUNG BÌNH':
        return { color: '#f59e0b', bg: '#fef3c7' };
      case 'THẤP':
        return { color: '#64748b', bg: '#f1f5f9' };
      default:
        return { color: '#64748b', bg: '#f1f5f9' };
    }
  };

  const getAlertTypeIcon = (type) => {
    switch (type) {
      case 'technical':
        return 'fas fa-tools';
      case 'safety':
        return 'fas fa-exclamation-triangle';
      case 'support':
        return 'fas fa-headset';
      default:
        return 'fas fa-bell';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
    if (seconds < 60) return 'Vừa xong';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="staff-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const sessionsChange = kpiStats.yesterdaySessions > 0 
    ? ((kpiStats.todaySessions - kpiStats.yesterdaySessions) / kpiStats.yesterdaySessions * 100).toFixed(1)
    : 0;
    
  const revenueChange = kpiStats.yesterdayRevenue > 0
    ? ((kpiStats.todayRevenue - kpiStats.yesterdayRevenue) / kpiStats.yesterdayRevenue * 100).toFixed(1)
    : 0;

  return (
    <div className="staff-dashboard">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Tổng quan Trạm sạc</h2>
          <p>Dashboard quản lý và giám sát hệ thống</p>
        </div>
        <button className="btn-secondary" onClick={fetchDashboardData}>
          <i className="fas fa-refresh"></i>
          Làm mới
        </button>
      </div>

      {/* 1. EMERGENCY ALERTS & WARNINGS */}
      <div className="section-card emergency-section">
        <div className="section-header">
          <h3>
            <i className="fas fa-exclamation-circle" style={{ color: '#ef4444' }}></i>
            Thông Báo & Cảnh Báo Khẩn Cấp
          </h3>
          {emergencyAlerts.length > 0 && (
            <span className="alert-count-badge">{emergencyAlerts.length}</span>
          )}
        </div>
        
        {emergencyAlerts.length === 0 ? (
          <div className="empty-alerts">
            <i className="fas fa-check-circle" style={{ color: '#10b981', fontSize: '2rem' }}></i>
            <p>Không có cảnh báo nào</p>
            <span>Tất cả hệ thống hoạt động bình thường</span>
          </div>
        ) : (
          <div className="alerts-list">
            {emergencyAlerts.map((alert) => {
              const badgeStyle = getPriorityBadgeColor(alert.priority);
              return (
                <div key={alert.id} className="alert-item">
                  <div className="alert-icon">
                    <i className={getAlertTypeIcon(alert.type)}></i>
                  </div>
                  <div className="alert-content">
                    <div className="alert-header">
                      <span className="priority-badge" style={{ color: badgeStyle.color, background: badgeStyle.bg }}>
                        {alert.priority}
                      </span>
                      <span className="alert-time">{formatTimeAgo(alert.timestamp)}</span>
                    </div>
                    <h4>{alert.title}</h4>
                    <p>{alert.message}</p>
                    {alert.stationId && (
                      <button 
                        className="btn-view-alert"
                        onClick={() => navigate(`/staff/monitoring?station=${alert.stationId}`)}
                      >
                        <i className="fas fa-eye"></i> Xem chi tiết
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. KPI STATS */}
      <div className="section-card kpi-section">
        <div className="section-header">
          <h3>
            <i className="fas fa-chart-line" style={{ color: '#3b82f6' }}></i>
            Chỉ Số Hiệu Suất Trạm (KPI)
          </h3>
          <span className="section-subtitle">Hôm nay</span>
        </div>
        
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon" style={{ background: '#3b82f615', color: '#3b82f6' }}>
                <i className="fas fa-bolt"></i>
              </div>
              <div className="kpi-trend" style={{ color: parseFloat(sessionsChange) >= 0 ? '#10b981' : '#ef4444' }}>
                <i className={`fas fa-${parseFloat(sessionsChange) >= 0 ? 'arrow-up' : 'arrow-down'}`}></i>
                {Math.abs(parseFloat(sessionsChange))}%
              </div>
            </div>
            <div className="kpi-value">{kpiStats.todaySessions}</div>
            <div className="kpi-label">Tổng lượt sạc hôm nay</div>
            <div className="kpi-comparison">
              Hôm qua: {kpiStats.yesterdaySessions} lượt
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon" style={{ background: '#10b98115', color: '#10b981' }}>
                <i className="fas fa-money-bill-wave"></i>
              </div>
              <div className="kpi-trend" style={{ color: parseFloat(revenueChange) >= 0 ? '#10b981' : '#ef4444' }}>
                <i className={`fas fa-${parseFloat(revenueChange) >= 0 ? 'arrow-up' : 'arrow-down'}`}></i>
                {Math.abs(parseFloat(revenueChange))}%
              </div>
            </div>
            <div className="kpi-value">{formatCurrency(kpiStats.todayRevenue)}</div>
            <div className="kpi-label">Tổng doanh thu hôm nay</div>
            <div className="kpi-comparison">
              Hôm qua: {formatCurrency(kpiStats.yesterdayRevenue)}
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon" style={{ background: '#8b5cf615', color: '#8b5cf6' }}>
                <i className="fas fa-percentage"></i>
              </div>
            </div>
            <div className="kpi-value">{kpiStats.utilizationRate.toFixed(1)}%</div>
            <div className="kpi-label">Tỷ lệ sử dụng trạm</div>
            <div className="kpi-progress">
              <div 
                className="kpi-progress-bar" 
                style={{ width: `${Math.min(kpiStats.utilizationRate, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon" style={{ background: '#f59e0b15', color: '#f59e0b' }}>
                <i className="fas fa-clock"></i>
              </div>
            </div>
            <div className="kpi-value">{kpiStats.avgChargingTime}</div>
            <div className="kpi-label">Thời gian sạc trung bình (phút)</div>
            <div className="kpi-comparison">
              Dựa trên {sessions.filter(s => s.sessionStatus?.toLowerCase() === 'completed').length} phiên hoàn thành
            </div>
          </div>
        </div>
      </div>

      {/* 3. TO-DO LIST */}
      <div className="section-card todo-section">
        <div className="section-header">
          <h3>
            <i className="fas fa-tasks" style={{ color: '#f59e0b' }}></i>
            Các Tác Vụ Cần Xử Lý
          </h3>
        </div>
        
        <div className="todo-grid">
          <div 
            className="todo-card clickable"
            onClick={() => navigate('/staff/sessions')}
          >
            <div className="todo-icon" style={{ background: '#ef444415', color: '#ef4444' }}>
              <i className="fas fa-headset"></i>
            </div>
            <div className="todo-content">
              <div className="todo-number">{todoItems.pendingSupportRequests}</div>
              <div className="todo-label">Yêu cầu hỗ trợ chờ xử lý</div>
              <div className="todo-action">
                <span>Xem chi tiết</span>
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
          </div>

          <div 
            className="todo-card clickable"
            onClick={() => navigate('/staff/incidents')}
          >
            <div className="todo-icon" style={{ background: '#f59e0b15', color: '#f59e0b' }}>
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="todo-content">
              <div className="todo-number">{todoItems.pendingIncidents}</div>
              <div className="todo-label">Báo cáo sự cố chờ xác nhận</div>
              <div className="todo-action">
                <span>Xem chi tiết</span>
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
          </div>

          <div 
            className="todo-card clickable"
            onClick={() => navigate('/staff/monitoring')}
          >
            <div className="todo-icon" style={{ background: '#3b82f615', color: '#3b82f6' }}>
              <i className="fas fa-charging-station"></i>
            </div>
            <div className="todo-content">
              <div className="todo-label">Theo dõi điểm sạc</div>
              <div className="todo-description">Giám sát trạng thái real-time</div>
              <div className="todo-action">
                <span>Mở monitoring</span>
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;

