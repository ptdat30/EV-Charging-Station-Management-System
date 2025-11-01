// src/components/staff/StaffDashboard.jsx
import React, { useState, useEffect } from 'react';
import { getAllStations } from '../../services/stationService';
import apiClient from '../../config/api';
import '../../styles/StaffDashboard.css';

const StaffDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    totalStations: 0,
    onlineStations: 0,
    offlineStations: 0,
    activeSessions: 0,
    totalChargers: 0,
    availableChargers: 0,
    inUseChargers: 0,
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

      // Fetch stations
      try {
        const stationsData = await getAllStations();
        console.log('📍 Stations response:', stationsData);
        // getAllStations() returns response.data directly, not { data: ... }
        stationsList = Array.isArray(stationsData) ? stationsData : (Array.isArray(stationsData?.data) ? stationsData.data : []);
        console.log('✅ Stations loaded:', stationsList.length);
      } catch (err) {
        console.error('❌ Error fetching stations:', err);
        stationsList = [];
      }

      // Fetch sessions
      try {
        const sessionsResponse = await apiClient.get('/sessions');
        console.log('📍 Sessions response:', sessionsResponse);
        sessionsList = Array.isArray(sessionsResponse.data) ? sessionsResponse.data : [];
        console.log('✅ Sessions loaded:', sessionsList.length);
      } catch (err) {
        console.error('❌ Error fetching sessions:', err);
        sessionsList = [];
      }

      setStations(stationsList);
      setSessions(sessionsList);

      // Calculate stats
      const totalStations = stationsList.length;
      const onlineStations = stationsList.filter(s => 
        s.status === 'online' || s.status === 'ACTIVE' || !s.status
      ).length;
      const offlineStations = totalStations - onlineStations;
      const activeSessions = sessionsList.filter(s => 
        s.sessionStatus === 'CHARGING' || s.sessionStatus === 'ACTIVE'
      ).length;

      // Count chargers (assuming each station has chargers array)
      let totalChargers = 0;
      let availableChargers = 0;
      let inUseChargers = 0;

      stationsList.forEach(station => {
        const stationChargers = station.chargers || [];
        totalChargers += stationChargers.length;
        stationChargers.forEach(charger => {
          if (charger.status === 'available' || charger.status === 'AVAILABLE') {
            availableChargers++;
          } else if (charger.status === 'in_use' || charger.status === 'IN_USE') {
            inUseChargers++;
          }
        });
      });

      setStats({
        totalStations,
        onlineStations,
        offlineStations,
        activeSessions,
        totalChargers,
        availableChargers,
        inUseChargers,
      });
      console.log('✅ Dashboard data loaded:', {
        stations: stationsList.length,
        sessions: sessionsList.length,
        stats
      });
      
      // Log detailed info for debugging
      if (stationsList.length > 0) {
        console.log('📍 Sample station:', stationsList[0]);
      }
      if (sessionsList.length > 0) {
        console.log('📍 Sample session:', sessionsList[0]);
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'online': { label: 'Online', color: '#10b981', bg: '#d1fae5' },
      'ACTIVE': { label: 'Hoạt động', color: '#10b981', bg: '#d1fae5' },
      'offline': { label: 'Offline', color: '#ef4444', bg: '#fee2e2' },
      'maintenance': { label: 'Bảo trì', color: '#f59e0b', bg: '#fef3c7' },
      'MAINTENANCE': { label: 'Bảo trì', color: '#f59e0b', bg: '#fef3c7' },
    };
    const config = statusMap[status] || { label: status, color: '#64748b', bg: '#f1f5f9' };
    return (
      <span className="status-badge" style={{ color: config.color, background: config.bg }}>
        {config.label}
      </span>
    );
  };

  const formatLocation = (location) => {
    if (!location) return 'Chưa cập nhật';
    
    try {
      // Nếu location là string JSON, parse nó
      let locationData;
      if (typeof location === 'string') {
        // Kiểm tra xem có phải JSON string không
        if (location.trim().startsWith('{')) {
          locationData = JSON.parse(location);
        } else {
          // Nếu không phải JSON, trả về string gốc
          return location;
        }
      } else {
        locationData = location;
      }

      // Format địa chỉ đẹp: address, district, city
      // Loại bỏ các phần trùng lặp
      const parts = [];
      const seen = new Set();
      
      if (locationData.address) {
        const addr = locationData.address.trim();
        if (addr && !seen.has(addr.toLowerCase())) {
          parts.push(addr);
          seen.add(addr.toLowerCase());
        }
      }
      
      if (locationData.district) {
        const dist = locationData.district.trim();
        if (dist && !seen.has(dist.toLowerCase())) {
          parts.push(dist);
          seen.add(dist.toLowerCase());
        }
      }
      
      if (locationData.city) {
        const city = locationData.city.trim();
        if (city && !seen.has(city.toLowerCase())) {
          parts.push(city);
          seen.add(city.toLowerCase());
        }
      }
      
      return parts.length > 0 ? parts.join(', ') : 'Chưa cập nhật';
    } catch (error) {
      // Nếu không parse được, trả về string gốc
      console.warn('Error parsing location:', error);
      return typeof location === 'string' ? location : 'Chưa cập nhật';
    }
  };

  if (loading && stations.length === 0 && sessions.length === 0) {
    return (
      <div className="staff-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-dashboard">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Tổng quan Trạm sạc</h2>
          <p>Theo dõi tình trạng các trạm và điểm sạc</p>
        </div>
        <button className="btn-secondary" onClick={fetchDashboardData}>
          <i className="fas fa-refresh"></i>
          Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3b82f615', color: '#3b82f6' }}>
            <i className="fas fa-charging-station"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalStations}</div>
            <div className="stat-label">Tổng số trạm</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#10b98115', color: '#10b981' }}>
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.onlineStations}</div>
            <div className="stat-label">Trạm đang hoạt động</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ef444415', color: '#ef4444' }}>
            <i className="fas fa-times-circle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.offlineStations}</div>
            <div className="stat-label">Trạm offline</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#8b5cf615', color: '#8b5cf6' }}>
            <i className="fas fa-bolt"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeSessions}</div>
            <div className="stat-label">Phiên sạc đang hoạt động</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f59e0b15', color: '#f59e0b' }}>
            <i className="fas fa-plug"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalChargers}</div>
            <div className="stat-label">Tổng điểm sạc</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#10b98115', color: '#10b981' }}>
            <i className="fas fa-circle-check"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.availableChargers}</div>
            <div className="stat-label">Điểm sạc sẵn sàng</div>
          </div>
        </div>
      </div>

      {/* Stations List */}
      <div className="stations-section">
        <div className="section-header">
          <h3>Danh sách trạm sạc</h3>
          <span className="section-badge">{stations.length} trạm</span>
        </div>
        
        {stations.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-charging-station"></i>
            <p>Chưa có trạm sạc nào</p>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
              Vui lòng kiểm tra kết nối API hoặc thử làm mới trang
            </p>
            <button 
              className="btn-secondary" 
              onClick={fetchDashboardData}
              style={{ marginTop: '1rem' }}
            >
              <i className="fas fa-refresh"></i>
              Thử lại
            </button>
          </div>
        ) : (
          <div className="stations-grid">
            {stations.map((station) => {
              const stationChargers = station.chargers || [];
              const stationSessions = sessions.filter(s => s.stationId === station.stationId || s.stationId === station.id);
              const activeStationSessions = stationSessions.filter(s => 
                s.sessionStatus === 'CHARGING' || s.sessionStatus === 'ACTIVE'
              );
              
              // Calculate charger stats
              const availableChargers = stationChargers.filter(c => 
                c.status === 'available' || c.status === 'AVAILABLE'
              ).length;
              const inUseChargers = stationChargers.filter(c => 
                c.status === 'in_use' || c.status === 'IN_USE'
              ).length;

              return (
                <div key={station.stationId || station.id} className="station-card">
                  <div className="station-card-header">
                    <div>
                      <h4>{station.stationName || station.stationCode}</h4>
                      <p className="station-code">{station.stationCode || `#${station.stationId || station.id}`}</p>
                    </div>
                    {getStatusBadge(station.status)}
                  </div>
                  
                  <div className="station-card-body">
                    <div className="station-info-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{formatLocation(station.location)}</span>
                    </div>
                    
                    <div className="station-stats">
                      <div className="station-stat-item">
                        <i className="fas fa-plug"></i>
                        <span><strong>{stationChargers.length}</strong> điểm sạc</span>
                      </div>
                      {availableChargers > 0 && (
                        <div className="station-stat-item" style={{ color: '#10b981' }}>
                          <i className="fas fa-circle-check"></i>
                          <span><strong>{availableChargers}</strong> trống</span>
                        </div>
                      )}
                      {inUseChargers > 0 && (
                        <div className="station-stat-item" style={{ color: '#f59e0b' }}>
                          <i className="fas fa-bolt"></i>
                          <span><strong>{inUseChargers}</strong> đang sạc</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="station-card-footer">
                    <a href={`/staff/monitoring?station=${station.stationId || station.id}`} className="btn-view-details">
                      <i className="fas fa-eye"></i>
                      Xem chi tiết
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Sessions */}
      {stats.activeSessions > 0 && (
        <div className="sessions-section">
          <div className="section-header">
            <h3>Phiên sạc đang hoạt động</h3>
            <span className="section-badge">{stats.activeSessions} phiên</span>
          </div>
          
          <div className="sessions-list">
            {sessions
              .filter(s => s.sessionStatus === 'CHARGING' || s.sessionStatus === 'ACTIVE')
              .slice(0, 5)
              .map((session) => (
                <div key={session.sessionId || session.id} className="session-card">
                  <div className="session-info">
                    <div className="session-header">
                      <span className="session-code">{session.sessionCode || `#${session.sessionId}`}</span>
                      <span className="session-status active">Đang sạc</span>
                    </div>
                    <div className="session-details">
                      <span>Trạm #{session.stationId}</span>
                      <span>•</span>
                      <span>Điểm sạc #{session.chargerId}</span>
                    </div>
                    {session.energyConsumed && (
                      <div className="session-energy">
                        <i className="fas fa-battery-three-quarters"></i>
                        <span>{parseFloat(session.energyConsumed).toFixed(2)} kWh</span>
                      </div>
                    )}
                  </div>
                  <div className="session-actions">
                    <a href={`/staff/sessions?session=${session.sessionId}`} className="btn-view">
                      Quản lý
                    </a>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;

