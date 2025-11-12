// src/components/admin/StationsManagement.jsx
import React, { useState, useEffect } from 'react';
import { getAllStations, getStationChargers, updateStation, updateChargerStatus } from '../../services/stationService';
import apiClient from '../../config/api';
import '../../styles/AdminStationsManagement.css';

const StationsManagement = () => {
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationChargers, setStationChargers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showChargerModal, setShowChargerModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchStations();
    
    // Auto refresh mỗi 15 giây để theo dõi tình trạng real-time
    const interval = setInterval(() => {
      fetchStations();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [stations, searchQuery, statusFilter, sortBy]);

  const fetchStations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllStations();
      setStations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching stations:', err);
      setError('Không thể tải danh sách trạm sạc');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...stations];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(station =>
        station.stationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.stationCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(station => station.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.stationName || '').localeCompare(b.stationName || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    setFilteredStations(filtered);
  };

  const handleViewStation = async (station) => {
    setSelectedStation(station);
    try {
      const chargers = await getStationChargers(station.stationId);
      setStationChargers(Array.isArray(chargers) ? chargers : []);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching chargers:', err);
      setStationChargers([]);
      setShowModal(true);
    }
  };

  const handleUpdateStationStatus = async (stationId, newStatus) => {
    try {
      // Với partial update, chỉ cần gửi status
      await updateStation(stationId, {
        status: newStatus
      });

      // Refresh stations list
      await fetchStations();
      
      // Update selected station if it's the one being updated
      if (selectedStation?.stationId === stationId) {
        setSelectedStation({ ...selectedStation, status: newStatus });
      }
    } catch (err) {
      console.error('Error updating station status:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Không thể cập nhật trạng thái trạm';
      alert(errorMessage);
    }
  };

  const handleUpdateChargerStatus = async (chargerId, newStatus) => {
    try {
      await updateChargerStatus(chargerId, newStatus);
      // Refresh chargers list
      if (selectedStation) {
        const chargers = await getStationChargers(selectedStation.stationId);
        setStationChargers(Array.isArray(chargers) ? chargers : []);
      }
    } catch (err) {
      console.error('Error updating charger status:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Không thể cập nhật trạng thái điểm sạc';
      alert(errorMessage);
    }
  };

  const handleRemoteControl = async (type, id, action) => {
    try {
      if (type === 'station') {
        let newStatus;
        switch (action) {
          case 'start':
            newStatus = 'online';
            break;
          case 'stop':
            newStatus = 'offline';
            break;
          default:
            return;
        }
        await handleUpdateStationStatus(id, newStatus);
      } else if (type === 'charger') {
        let newStatus;
        switch (action) {
          case 'start':
            newStatus = 'available';
            break;
          case 'stop':
            newStatus = 'offline';
            break;
          default:
            return;
        }
        await handleUpdateChargerStatus(id, newStatus);
      }
    } catch (err) {
      console.error('Error in remote control:', err);
    }
  };

  const handleDeleteStation = async (stationId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa trạm này?')) {
      return;
    }

    try {
      await apiClient.delete(`/stations/${stationId}`);
      await fetchStations();
      if (selectedStation?.stationId === stationId) {
        setShowModal(false);
        setSelectedStation(null);
      }
    } catch (err) {
      console.error('Error deleting station:', err);
      alert('Không thể xóa trạm');
    }
  };

  const getStatusConfig = (status) => {
    const statusConfig = {
      online: { label: 'Hoạt động', color: '#10b981', bg: '#d1fae5' },
      offline: { label: 'Offline', color: '#6b7280', bg: '#f3f4f6' },
      maintenance: { label: 'Bảo trì', color: '#f59e0b', bg: '#fef3c7' },
      closed: { label: 'Đóng cửa', color: '#ef4444', bg: '#fee2e2' }
    };
    return statusConfig[status] || statusConfig.offline;
  };

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    return (
      <span className="status-badge" style={{ color: config.color, background: config.bg }}>
        {config.label}
      </span>
    );
  };

  const getChargerStatusBadge = (status) => {
    const statusConfig = {
      available: { label: 'Sẵn sàng', color: '#10b981', bg: '#d1fae5' },
      in_use: { label: 'Đang sạc', color: '#3b82f6', bg: '#dbeafe' },
      offline: { label: 'Offline', color: '#6b7280', bg: '#f3f4f6' },
      maintenance: { label: 'Bảo trì', color: '#f59e0b', bg: '#fef3c7' },
      reserved: { label: 'Đã đặt', color: '#8b5cf6', bg: '#ede9fe' }
    };
    const config = statusConfig[status] || statusConfig.offline;
    return (
      <span className="status-badge" style={{ color: config.color, background: config.bg }}>
        {config.label}
      </span>
    );
  };

  if (loading && stations.length === 0) {
    return (
      <div className="stations-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách trạm sạc...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stations-management">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Quản lý Trạm Sạc</h2>
          <p>Theo dõi và quản lý toàn bộ trạm sạc trong hệ thống</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={fetchStations}>
            <i className="fas fa-refresh"></i>
            Làm mới
          </button>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <i className="fas fa-plus"></i>
            Thêm trạm mới
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-item">
          <div className="stat-value">{stations.length}</div>
          <div className="stat-label">Tổng số trạm</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#10b981' }}>
            {stations.filter(s => s.status === 'online').length}
          </div>
          <div className="stat-label">Đang hoạt động</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#f59e0b' }}>
            {stations.filter(s => s.status === 'maintenance').length}
          </div>
          <div className="stat-label">Đang bảo trì</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#6b7280' }}>
            {stations.filter(s => s.status === 'offline').length}
          </div>
          <div className="stat-label">Offline</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã trạm, địa điểm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="online">Hoạt động</option>
          <option value="offline">Offline</option>
          <option value="maintenance">Bảo trì</option>
          <option value="closed">Đóng cửa</option>
        </select>
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sắp xếp theo tên</option>
          <option value="status">Sắp xếp theo trạng thái</option>
          <option value="rating">Sắp xếp theo đánh giá</option>
        </select>
      </div>

      {/* Stations Table */}
      {error ? (
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchStations}>
            Thử lại
          </button>
        </div>
      ) : (
        <div className="stations-table-container">
          <table className="stations-table">
            <thead>
              <tr>
                <th>Mã trạm</th>
                <th>Tên trạm</th>
                <th>Địa điểm</th>
                <th>Trạng thái</th>
                <th>Đánh giá</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data-cell">
                    <i className="fas fa-inbox"></i>
                    <p>Không tìm thấy trạm nào</p>
                  </td>
                </tr>
              ) : (
                filteredStations.map((station) => (
                  <tr key={station.stationId}>
                    <td>
                      <span className="station-code">{station.stationCode}</span>
                    </td>
                    <td>
                      <strong>{station.stationName}</strong>
                    </td>
                    <td>
                      <span className="location-text">
                        {(() => {
                          try {
                            if (!station.location) return 'Chưa có địa điểm';
                            const loc = typeof station.location === 'string' 
                              ? JSON.parse(station.location) 
                              : station.location;
                            return loc.address || loc.location || JSON.stringify(loc);
                          } catch {
                            return station.location || 'Chưa có địa điểm';
                          }
                        })()}
                      </span>
                    </td>
                    <td>
                      <div className="status-select-wrapper">
                        <select
                          className="status-select"
                          value={station.status}
                          onChange={(e) => handleUpdateStationStatus(station.stationId, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          title="Thay đổi trạng thái"
                          style={(() => {
                            const config = getStatusConfig(station.status);
                            return {
                              color: config.color,
                              backgroundColor: config.bg,
                              borderColor: config.color
                            };
                          })()}
                        >
                          <option value="online">Hoạt động</option>
                          <option value="offline">Offline</option>
                          <option value="maintenance">Bảo trì</option>
                          <option value="closed">Đóng cửa</option>
                        </select>
                      </div>
                    </td>
                    <td>
                      {station.rating ? (
                        <div className="rating">
                          <i className="fas fa-star" style={{ color: '#fbbf24' }}></i>
                          <span>{station.rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="no-rating">Chưa có đánh giá</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => handleViewStation(station)}
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => {
                            setSelectedStation(station);
                            setShowCreateModal(true);
                          }}
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDeleteStation(station.stationId)}
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Station Detail Modal */}
      {showModal && selectedStation && (
        <StationDetailModal
          station={selectedStation}
          chargers={stationChargers}
          onClose={() => {
            setShowModal(false);
            setSelectedStation(null);
            setStationChargers([]);
          }}
          onUpdateStationStatus={handleUpdateStationStatus}
          onUpdateChargerStatus={handleUpdateChargerStatus}
          onRefreshChargers={() => {
            getStationChargers(selectedStation.stationId).then(data => {
              setStationChargers(Array.isArray(data) ? data : []);
            });
          }}
        />
      )}
    </div>
  );
};

// ==========================================
// Station Detail Modal Component - REBUILT
// ==========================================
const StationDetailModal = ({ 
  station, 
  chargers, 
  onClose, 
  onUpdateStationStatus,
  onUpdateChargerStatus,
  onRefreshChargers
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusBadge = (status) => {
    const statusConfig = {
      online: { label: 'Hoạt động', color: '#10b981', bg: '#d1fae5' },
      offline: { label: 'Offline', color: '#6b7280', bg: '#f3f4f6' },
      maintenance: { label: 'Bảo trì', color: '#f59e0b', bg: '#fef3c7' },
      closed: { label: 'Đóng cửa', color: '#ef4444', bg: '#fee2e2' }
    };
    const config = statusConfig[status] || statusConfig.offline;
    return (
      <span className="status-badge" style={{ color: config.color, background: config.bg }}>
        {config.label}
      </span>
    );
  };

  const getChargerStatusBadge = (status) => {
    const statusConfig = {
      available: { label: 'Sẵn sàng', color: '#10b981', bg: '#d1fae5' },
      in_use: { label: 'Đang sạc', color: '#3b82f6', bg: '#dbeafe' },
      offline: { label: 'Offline', color: '#6b7280', bg: '#f3f4f6' },
      maintenance: { label: 'Bảo trì', color: '#f59e0b', bg: '#fef3c7' },
      reserved: { label: 'Đã đặt', color: '#8b5cf6', bg: '#ede9fe' }
    };
    const config = statusConfig[status] || statusConfig.offline;
    return (
      <span className="status-badge" style={{ color: config.color, background: config.bg }}>
        {config.label}
      </span>
    );
  };

  const handleRemoteControl = async (type, id, action) => {
    setIsUpdating(true);
    try {
      if (type === 'station') {
        let newStatus;
        if (action === 'start') newStatus = 'online';
        else if (action === 'stop') newStatus = 'offline';
        else if (action === 'maintenance') newStatus = 'maintenance';
        
        if (newStatus) {
          await onUpdateStationStatus(id, newStatus);
        }
      } else if (type === 'charger') {
        let newStatus;
        if (action === 'start') newStatus = 'available';
        else if (action === 'stop') newStatus = 'offline';
        else if (action === 'maintenance') newStatus = 'maintenance';
        
        if (newStatus) {
          await onUpdateChargerStatus(id, newStatus);
        }
      }
    } catch (error) {
      console.error('Remote control error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!station) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div 
        className="modal-content station-detail-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}
      >
        <div className="modal-header">
          <div>
            <h3>
              <i className="fas fa-charging-station" style={{ marginRight: '10px', color: '#10b981' }}></i>
              Chi tiết Trạm Sạc
            </h3>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
              Thông tin và điều khiển trạm sạc
            </p>
          </div>
          <button 
            className="modal-close" 
            onClick={onClose}
            style={{ 
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '8px',
              borderRadius: '6px'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Station Info */}
          <div className="station-info-section">
            <div className="info-row">
              <span className="info-label">Mã trạm:</span>
              <span className="info-value">{station.stationCode}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Tên trạm:</span>
              <span className="info-value">{station.stationName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Địa điểm:</span>
              <span className="info-value">
                {(() => {
                  try {
                    if (!station.location) return 'Chưa có địa điểm';
                    const loc = typeof station.location === 'string' 
                      ? JSON.parse(station.location) 
                      : station.location;
                    if (loc.address) {
                      return `${loc.address}${loc.district ? ', ' + loc.district : ''}${loc.city ? ', ' + loc.city : ''}`;
                    }
                    return loc.location || JSON.stringify(loc);
                  } catch {
                    return station.location || 'Chưa có địa điểm';
                  }
                })()}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Trạng thái:</span>
              {getStatusBadge(station.status)}
            </div>
            {station.rating && (
              <div className="info-row">
                <span className="info-label">Đánh giá:</span>
                <span className="info-value">
                  <i className="fas fa-star" style={{ color: '#fbbf24' }}></i>
                  {station.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Remote Control */}
          <div className="remote-control-section">
            <h4>Điều khiển từ xa</h4>
            <div className="control-buttons">
              <button
                className="btn-control btn-start"
                onClick={() => handleRemoteControl('station', station.stationId, 'start')}
                disabled={station.status === 'online'}
              >
                <i className="fas fa-play"></i>
                Bật trạm
              </button>
              <button
                className="btn-control btn-stop"
                onClick={() => handleRemoteControl('station', station.stationId, 'stop')}
                disabled={station.status === 'offline'}
              >
                <i className="fas fa-stop"></i>
                Tắt trạm
              </button>
              <button
                className="btn-control btn-maintenance"
                onClick={() => onUpdateStationStatus(station.stationId, 'maintenance')}
                disabled={station.status === 'maintenance'}
              >
                <i className="fas fa-wrench"></i>
                Chế độ bảo trì
              </button>
            </div>
          </div>

          {/* Chargers List */}
          <div className="chargers-section">
            <div className="section-header">
              <h4>Điểm sạc ({chargers.length})</h4>
              <button className="btn-secondary btn-sm" onClick={onRefreshChargers}>
                <i className="fas fa-refresh"></i>
                Làm mới
              </button>
            </div>
            <div className="chargers-grid">
              {chargers.length === 0 ? (
                <div className="no-chargers">
                  <i className="fas fa-charging-station"></i>
                  <p>Chưa có điểm sạc nào</p>
                </div>
              ) : (
                chargers.map((charger) => (
                  <div key={charger.chargerId} className="charger-card">
                    <div className="charger-header">
                      <div>
                        <h5>{charger.chargerCode}</h5>
                        <p className="charger-type">{charger.chargerType}</p>
                      </div>
                      {getChargerStatusBadge(charger.status)}
                    </div>
                    <div className="charger-details">
                      <div className="detail-item">
                        <i className="fas fa-bolt"></i>
                        <span>{charger.powerRating} kW</span>
                      </div>
                    </div>
                    <div className="charger-actions">
                      <button
                        className="btn-control btn-sm"
                        onClick={() => handleRemoteControl('charger', charger.chargerId, 'start')}
                        disabled={charger.status === 'available' || charger.status === 'in_use'}
                        title="Bật điểm sạc"
                      >
                        <i className="fas fa-play"></i>
                      </button>
                      <button
                        className="btn-control btn-sm btn-stop"
                        onClick={() => handleRemoteControl('charger', charger.chargerId, 'stop')}
                        disabled={charger.status === 'offline'}
                        title="Tắt điểm sạc"
                      >
                        <i className="fas fa-stop"></i>
                      </button>
                      <button
                        className="btn-control btn-sm btn-maintenance"
                        onClick={() => onUpdateChargerStatus(charger.chargerId, 'maintenance')}
                        disabled={charger.status === 'maintenance'}
                        title="Bảo trì"
                      >
                        <i className="fas fa-wrench"></i>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationsManagement;
