// src/components/staff/ChargingPointMonitoring.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllStations, getStationChargers, updateChargerStatus } from '../../services/stationService';
import { getSessionById, getSessionStatus } from '../../services/chargingService';
import apiClient from '../../config/api';
import '../../styles/StaffMonitoring.css';

const ChargingPointMonitoring = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [chargers, setChargers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingChargerId, setUpdatingChargerId] = useState(null);

  // Handle URL params change - select station from URL
  useEffect(() => {
    const stationIdParam = searchParams.get('station');
    if (stationIdParam && stations.length > 0) {
      const station = stations.find(s => 
        (s.stationId || s.id)?.toString() === stationIdParam.toString()
      );
      if (station && (!selectedStation || (selectedStation.stationId || selectedStation.id) !== (station.stationId || station.id))) {
        setSelectedStation(station);
      }
    }
  }, [searchParams, stations]); // Only depend on searchParams and stations

  // Fetch all data - use refs to avoid dependency issues
  const selectedStationRef = React.useRef(selectedStation);
  const searchParamsRef = React.useRef(searchParams);
  
  useEffect(() => {
    selectedStationRef.current = selectedStation;
  }, [selectedStation]);
  
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  const fetchData = useCallback(async (preserveSelection = true) => {
    try {
      setLoading(true);
      
      // Fetch stations
      const stationsData = await getAllStations().catch(() => []);
      let stationsList = [];
      if (Array.isArray(stationsData)) {
        stationsList = stationsData;
      } else if (stationsData && Array.isArray(stationsData.data)) {
        stationsList = stationsData.data;
      }

      // If station ID in URL, select it (only on initial load)
      const stationIdParam = searchParamsRef.current.get('station');
      const currentSelectedStation = selectedStationRef.current;
      
      if (stationIdParam && stationsList.length > 0 && !preserveSelection) {
        const station = stationsList.find(s => 
          (s.stationId || s.id)?.toString() === stationIdParam.toString()
        );
        if (station) {
          setSelectedStation(station);
        }
      } else if (preserveSelection && currentSelectedStation) {
        // Refresh selected station data
        const updated = stationsList.find(s => 
          (s.stationId || s.id) === (currentSelectedStation.stationId || currentSelectedStation.id)
        );
        if (updated) {
          setSelectedStation(updated);
        }
      }

      setStations(stationsList);

      // Fetch sessions
      try {
        const response = await apiClient.get('/sessions').catch(() => ({ data: [] }));
        const sessionsList = Array.isArray(response.data) ? response.data : [];
        setSessions(sessionsList);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setSessions([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies - stable function



  // Fetch chargers for selected station
  const fetchChargers = useCallback(async (stationId) => {
    try {
      const chargersData = await getStationChargers(stationId);
      setChargers(Array.isArray(chargersData) ? chargersData : []);
    } catch (error) {
      console.error('Error fetching chargers:', error);
      setChargers([]);
    }
  }, []);

  // Initial load - only run once on mount
  useEffect(() => {
    // Initial load - don't preserve selection on first load
    fetchData(false);
  }, []); // Empty dependency array - only run on mount

  // Setup auto refresh interval - separate effect
  useEffect(() => {
    // Only setup interval if fetchData is stable
    if (!fetchData) return;
    
    const interval = setInterval(() => {
      // Preserve selection when auto-refreshing
      fetchData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Load chargers when station is selected
  useEffect(() => {
    if (selectedStation) {
      const stationId = selectedStation.stationId || selectedStation.id;
      if (stationId) {
        fetchChargers(stationId);
        // Sessions are already fetched in fetchData
      }
    }
  }, [selectedStation, fetchChargers]);

  const handleStationSelect = (station) => {
    setSelectedStation(station);
    // Update URL without navigation
    navigate(`/staff/monitoring?station=${station.stationId || station.id}`, { replace: true });
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

    setUpdatingChargerId(chargerId);
    try {
      await updateChargerStatus(chargerId, newStatus);
      
      // Update local state
      setChargers(prev => prev.map(c => 
        (c.chargerId || c.id) === chargerId 
          ? { ...c, status: newStatus }
          : c
      ));

      // Refresh stations to update stats (preserve selection)
      fetchData(true);
      
      alert('✅ Đã cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Error updating charger status:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Không thể cập nhật trạng thái';
      alert(`❌ ${errorMsg}`);
    } finally {
      setUpdatingChargerId(null);
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
    return sessions.find(s => {
      const sessionChargerId = s.chargerId;
      const sessionStatus = s.sessionStatus?.toLowerCase();
      return sessionChargerId === chargerId && 
             (sessionStatus === 'charging' || sessionStatus === 'active' || sessionStatus === 'starting');
    });
  };

  // Filter chargers
  const filteredChargers = chargers.filter(charger => {
    // Status filter
    if (filterStatus !== 'all') {
      const status = charger.status?.toLowerCase() || '';
      if (status !== filterStatus.toLowerCase()) return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const chargerCode = (charger.chargerCode || '').toLowerCase();
      const chargerType = (charger.chargerType || '').toLowerCase();
      if (!chargerCode.includes(query) && !chargerType.includes(query)) {
        return false;
      }
    }

    return true;
  });

  // Calculate stats
  const stationStats = selectedStation ? {
    total: chargers.length,
    available: chargers.filter(c => (c.status?.toLowerCase() || '') === 'available').length,
    inUse: chargers.filter(c => (c.status?.toLowerCase() || '') === 'in_use').length,
    offline: chargers.filter(c => (c.status?.toLowerCase() || '') === 'offline').length,
    maintenance: chargers.filter(c => (c.status?.toLowerCase() || '') === 'maintenance').length,
    reserved: chargers.filter(c => (c.status?.toLowerCase() || '') === 'reserved').length,
    activeSessions: chargers.filter(c => getChargerSession(c.chargerId || c.id)).length,
  } : null;

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
        <button className="btn-secondary" onClick={fetchData} disabled={loading}>
          <i className={`fas fa-refresh ${loading ? 'fa-spin' : ''}`}></i>
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
          {stations.map(station => {
            const stationChargers = station.chargers || [];
            const availableCount = stationChargers.filter(c => 
              (c.status?.toLowerCase() || '') === 'available'
            ).length;
            const inUseCount = stationChargers.filter(c => 
              (c.status?.toLowerCase() || '') === 'in_use'
            ).length;

            return (
              <div
                key={station.stationId || station.id}
                className={`station-card-selector ${
                  selectedStation && (selectedStation.stationId || selectedStation.id) === (station.stationId || station.id) 
                    ? 'active' 
                    : ''
                }`}
                onClick={() => handleStationSelect(station)}
              >
                <div className="station-card-header">
                  <div>
                    <h4>{station.stationName || station.stationCode}</h4>
                    <p className="station-code">{station.stationCode}</p>
                  </div>
                  <span className="charger-count">
                    {stationChargers.length} điểm sạc
                  </span>
                </div>
                <div className="station-stats">
                  <span>
                    <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
                    {availableCount} sẵn sàng
                  </span>
                  <span>
                    <i className="fas fa-bolt" style={{ color: '#3b82f6' }}></i>
                    {inUseCount} đang dùng
                  </span>
                </div>
              </div>
            );
          })}
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
              {stationStats && (
                <div className="station-stats-bar">
                  <span>Tổng: <strong>{stationStats.total}</strong></span>
                  <span className="stat-available">Sẵn sàng: <strong>{stationStats.available}</strong></span>
                  <span className="stat-in-use">Đang sạc: <strong>{stationStats.inUse}</strong></span>
                  <span className="stat-offline">Offline: <strong>{stationStats.offline}</strong></span>
                  <span className="stat-maintenance">Bảo trì: <strong>{stationStats.maintenance}</strong></span>
                  <span className="stat-sessions">Phiên đang chạy: <strong>{stationStats.activeSessions}</strong></span>
                </div>
              )}
            </div>
            <div className="filter-controls">
              <input
                type="text"
                className="search-input"
                placeholder="Tìm kiếm điểm sạc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
              <p>Không có điểm sạc nào phù hợp</p>
              {(filterStatus !== 'all' || searchQuery) && (
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    setFilterStatus('all');
                    setSearchQuery('');
                  }}
                  style={{ marginTop: '1rem' }}
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div className="chargers-grid">
              {filteredChargers.map((charger) => {
                const activeSession = getChargerSession(charger.chargerId || charger.id);
                const isUpdating = updatingChargerId === (charger.chargerId || charger.id);
                
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
                            <button
                              className="btn-view-session"
                              onClick={() => navigate(`/staff/sessions?session=${activeSession.sessionId}`)}
                            >
                              <i className="fas fa-eye"></i> Chi tiết
                            </button>
                          </div>
                          <div className="session-details">
                            <span>Phiên: {activeSession.sessionCode || `#${activeSession.sessionId}`}</span>
                            <span>User ID: {activeSession.userId}</span>
                            {activeSession.energyConsumed && (
                              <span>
                                Năng lượng: {parseFloat(activeSession.energyConsumed).toFixed(2)} kWh
                              </span>
                            )}
                            {activeSession.startTime && (
                              <span>
                                Bắt đầu: {new Date(activeSession.startTime).toLocaleTimeString('vi-VN')}
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
                          disabled={isUpdating}
                        >
                          <option value="available">Sẵn sàng</option>
                          <option value="in_use">Đang sạc</option>
                          <option value="offline">Offline</option>
                          <option value="maintenance">Bảo trì</option>
                          <option value="reserved">Đã đặt</option>
                        </select>
                        {isUpdating && (
                          <i className="fas fa-spinner fa-spin" style={{ marginLeft: '8px', color: '#3b82f6' }}></i>
                        )}
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

