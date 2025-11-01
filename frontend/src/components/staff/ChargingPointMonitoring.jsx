// src/components/staff/ChargingPointMonitoring.jsx
import React, { useState, useEffect } from 'react';
import { getAllStations } from '../../services/stationService';
import apiClient from '../../config/api';
import '../../styles/StaffMonitoring.css';

const ChargingPointMonitoring = () => {
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
    // Auto refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedStation) {
      fetchSessionsForStation(selectedStation.stationId || selectedStation.id);
    }
  }, [selectedStation]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const stationsData = await getAllStations().catch(() => []);
      
      // getAllStations() returns data directly, not { data: ... }
      let stationsList = [];
      if (Array.isArray(stationsData)) {
        stationsList = stationsData;
      } else if (stationsData && Array.isArray(stationsData.data)) {
        stationsList = stationsData.data;
      }

      setStations(stationsList);
      if (selectedStation) {
        // Refresh selected station
        const updated = stationsList.find(s => 
          (s.stationId || s.id) === (selectedStation.stationId || selectedStation.id)
        );
        if (updated) setSelectedStation(updated);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionsForStation = async (stationId) => {
    try {
      const response = await apiClient.get('/sessions').catch(() => ({ data: [] }));
      const sessionsList = Array.isArray(response.data) ? response.data : [];
      const stationSessions = sessionsList.filter(s => 
        s.stationId === stationId || s.stationId === stationId
      );
      setSessions(stationSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    }
  };

  const handleStationSelect = (station) => {
    setSelectedStation(station);
  };

  const handleUpdateStatus = async (chargerId, newStatus) => {
    const statusLabels = {
      'available': 'Sẵn sàng',
      'in_use': 'Đang sạc',
      'offline': 'Offline',
      'maintenance': 'Bảo trì',
      'reserved': 'Đã đặt',
    };
    const label = statusLabels[newStatus] || newStatus;
    
    if (!confirm(`Bạn có chắc chắn muốn cập nhật trạng thái điểm sạc #${chargerId} thành "${label}"?`)) {
      return;
    }

    try {
      // Update charger status - backend expects enum value (lowercase as per Charger.ChargerStatus enum)
      await apiClient.put(`/chargers/${chargerId}`, {
        status: newStatus, // Backend enum is lowercase: available, in_use, offline, maintenance, reserved
      });

      alert('✅ Đã cập nhật trạng thái thành công!');
      fetchData();
    } catch (error) {
      console.error('Error updating charger status:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Không thể cập nhật trạng thái';
      alert(`❌ ${errorMsg}`);
    }
  };

  const getChargerStatusBadge = (status) => {
    const statusMap = {
      'available': { label: 'Sẵn sàng', color: '#10b981', bg: '#d1fae5', icon: 'check-circle' },
      'AVAILABLE': { label: 'Sẵn sàng', color: '#10b981', bg: '#d1fae5', icon: 'check-circle' },
      'in_use': { label: 'Đang sạc', color: '#3b82f6', bg: '#dbeafe', icon: 'bolt' },
      'IN_USE': { label: 'Đang sạc', color: '#3b82f6', bg: '#dbeafe', icon: 'bolt' },
      'offline': { label: 'Offline', color: '#64748b', bg: '#f1f5f9', icon: 'power-off' },
      'OFFLINE': { label: 'Offline', color: '#64748b', bg: '#f1f5f9', icon: 'power-off' },
      'maintenance': { label: 'Bảo trì', color: '#f59e0b', bg: '#fef3c7', icon: 'tools' },
      'MAINTENANCE': { label: 'Bảo trì', color: '#f59e0b', bg: '#fef3c7', icon: 'tools' },
      'reserved': { label: 'Đã đặt', color: '#8b5cf6', bg: '#ede9fe', icon: 'calendar-check' },
      'RESERVED': { label: 'Đã đặt', color: '#8b5cf6', bg: '#ede9fe', icon: 'calendar-check' },
    };
    const statusLower = status?.toLowerCase() || '';
    const config = statusMap[statusLower] || statusMap[status] || { 
      label: status, 
      color: '#64748b', 
      bg: '#f1f5f9', 
      icon: 'question-circle' 
    };
    return (
      <span className="status-badge" style={{ color: config.color, background: config.bg }}>
        <i className={`fas fa-${config.icon}`}></i>
        {config.label}
      </span>
    );
  };

  const getChargerSession = (chargerId) => {
    return sessions.find(s => 
      s.chargerId === chargerId && 
      (s.sessionStatus === 'CHARGING' || s.sessionStatus === 'charging' || s.sessionStatus === 'ACTIVE')
    );
  };

  const filteredChargers = selectedStation ? (selectedStation.chargers || []).filter(charger => {
    if (filterStatus === 'all') return true;
    const status = charger.status?.toLowerCase() || '';
    return status === filterStatus.toLowerCase();
  }) : [];

  if (loading && stations.length === 0) {
    return (
      <div className="charging-monitoring">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="charging-monitoring">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Theo dõi Điểm sạc</h2>
          <p>Giám sát và quản lý trạng thái các điểm sạc theo thời gian thực</p>
        </div>
        <button className="btn-secondary" onClick={fetchData}>
          <i className="fas fa-refresh"></i>
          Làm mới
        </button>
      </div>

      {/* Station Selector */}
      <div className="station-selector-section">
        <label>
          <i className="fas fa-charging-station"></i>
          Chọn trạm sạc
        </label>
        <div className="station-grid">
          {stations.map(station => (
            <div
              key={station.stationId || station.id}
              className={`station-card-selector ${selectedStation && (selectedStation.stationId || selectedStation.id) === (station.stationId || station.id) ? 'active' : ''}`}
              onClick={() => handleStationSelect(station)}
            >
              <div className="station-card-header">
                <div>
                  <h4>{station.stationName || station.stationCode}</h4>
                  <p className="station-code">{station.stationCode}</p>
                </div>
                <span className="charger-count">
                  {station.chargers?.length || 0} điểm sạc
                </span>
              </div>
              <div className="station-stats">
                <span>
                  <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
                  {station.chargers?.filter(c => c.status === 'available' || c.status === 'AVAILABLE').length || 0} sẵn sàng
                </span>
                <span>
                  <i className="fas fa-bolt" style={{ color: '#3b82f6' }}></i>
                  {station.chargers?.filter(c => c.status === 'in_use' || c.status === 'IN_USE').length || 0} đang dùng
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chargers Detail View */}
      {selectedStation && (
        <div className="chargers-detail-section">
          <div className="section-header">
            <div>
              <h3>
                <i className="fas fa-plug"></i>
                Điểm sạc tại {selectedStation.stationName || selectedStation.stationCode}
              </h3>
              <p>Tổng số: {selectedStation.chargers?.length || 0} điểm sạc</p>
            </div>
            <div className="filter-controls">
              <select
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="available">Sẵn sàng</option>
                <option value="in_use">Đang sạc</option>
                <option value="offline">Offline</option>
                <option value="maintenance">Bảo trì</option>
                <option value="reserved">Đã đặt</option>
              </select>
            </div>
          </div>

          {filteredChargers.length === 0 ? (
            <div className="no-chargers">
              <i className="fas fa-plug"></i>
              <p>Không có điểm sạc nào</p>
            </div>
          ) : (
            <div className="chargers-grid">
              {filteredChargers.map((charger) => {
                const activeSession = getChargerSession(charger.chargerId || charger.id);
                return (
                  <div key={charger.chargerId || charger.id} className="charger-card">
                    <div className="charger-card-header">
                      <div>
                        <h4>{charger.chargerCode || `#${charger.chargerId || charger.id}`}</h4>
                        <p className="charger-type">{charger.chargerType || 'N/A'}</p>
                      </div>
                      {getChargerStatusBadge(charger.status)}
                    </div>

                    <div className="charger-card-body">
                      <div className="charger-info-item">
                        <i className="fas fa-bolt"></i>
                        <span>Công suất: {charger.powerRating ? `${parseFloat(charger.powerRating)} kW` : 'N/A'}</span>
                      </div>
                      
                      {activeSession && (
                        <div className="active-session-info">
                          <div className="session-header">
                            <i className="fas fa-charging-station"></i>
                            <strong>Đang sạc</strong>
                          </div>
                          <div className="session-details">
                            <span>Phiên: {activeSession.sessionCode || `#${activeSession.sessionId}`}</span>
                            <span>User: {activeSession.userId}</span>
                            {activeSession.energyConsumed && (
                              <span>
                                Năng lượng: {parseFloat(activeSession.energyConsumed).toFixed(2)} kWh
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="charger-actions">
                        <select
                          className="status-select"
                          value={charger.status || 'available'}
                          onChange={(e) => handleUpdateStatus(charger.chargerId || charger.id, e.target.value)}
                        >
                          <option value="available">Sẵn sàng</option>
                          <option value="in_use">Đang sạc</option>
                          <option value="offline">Offline</option>
                          <option value="maintenance">Bảo trì</option>
                          <option value="reserved">Đã đặt</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!selectedStation && (
        <div className="no-selection">
          <i className="fas fa-mouse-pointer"></i>
          <p>Chọn một trạm sạc để xem chi tiết các điểm sạc</p>
        </div>
      )}
    </div>
  );
};

export default ChargingPointMonitoring;

