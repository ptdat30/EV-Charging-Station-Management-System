// src/components/admin/StationsManagement.jsx
import React, { useState, useEffect } from 'react';
import { getAllStations, updateStation, getStationChargers } from '../../services/stationService';
import apiClient from '../../config/api';
import '../../styles/AdminStationsManagement.css';

const StationsManagement = () => {
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationChargers, setStationChargers] = useState([]);
  const [editFormData, setEditFormData] = useState({});
  
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


  const handleUpdateStationStatus = async (stationId, newStatus) => {
    try {
      // Với partial update, chỉ cần gửi status
      await updateStation(stationId, {
        status: newStatus
      });

      // Refresh stations list
      await fetchStations();
    } catch (err) {
      console.error('Error updating station status:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Không thể cập nhật trạng thái trạm';
      alert(errorMessage);
    }
  };

  const handleViewStation = async (station) => {
    setSelectedStation(station);
    try {
      const chargers = await getStationChargers(station.stationId);
        setStationChargers(Array.isArray(chargers) ? chargers : []);
    } catch (err) {
      console.error('Error fetching chargers:', err);
      setStationChargers([]);
    }
    setShowDetailModal(true);
  };

  const handleEditStation = (station) => {
    setSelectedStation(station);
    setEditFormData({
      stationName: station.stationName || '',
      stationCode: station.stationCode || '',
      location: typeof station.location === 'string' 
        ? station.location 
        : JSON.stringify(station.location || {}),
      status: station.status || 'online',
      description: station.description || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedStation) return;

    try {
      let locationData = editFormData.location;
      try {
        locationData = JSON.parse(editFormData.location);
      } catch {
        // Keep as string if invalid JSON
      }

      await updateStation(selectedStation.stationId, {
        stationName: editFormData.stationName,
        stationCode: editFormData.stationCode,
        location: locationData,
        status: editFormData.status,
        description: editFormData.description
      });

      await fetchStations();
      setShowEditModal(false);
      setSelectedStation(null);
      setEditFormData({});
    } catch (err) {
      console.error('Error updating station:', err);
      alert(err.response?.data?.message || 'Không thể cập nhật trạm');
    }
  };

  const handleDeleteStation = async (stationId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa trạm này?')) {
      return;
    }

    try {
      await apiClient.delete(`/stations/${stationId}`);
      await fetchStations();
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
                          onClick={() => handleEditStation(station)}
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
      {showDetailModal && selectedStation && (
        <div className="modal-overlay" onClick={() => { setShowDetailModal(false); setSelectedStation(null); setStationChargers([]); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
            <h3>
              <i className="fas fa-charging-station" style={{ marginRight: '10px', color: '#10b981' }}></i>
              Chi tiết Trạm Sạc
            </h3>
              <button className="modal-close" onClick={() => { setShowDetailModal(false); setSelectedStation(null); setStationChargers([]); }}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
              <div style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Mã trạm:</strong>
                  <p style={{ marginTop: '5px', color: '#6b7280' }}>{selectedStation.stationCode}</p>
            </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Tên trạm:</strong>
                  <p style={{ marginTop: '5px', color: '#6b7280' }}>{selectedStation.stationName}</p>
            </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Địa điểm:</strong>
                  <p style={{ marginTop: '5px', color: '#6b7280' }}>
                {(() => {
                  try {
                        if (!selectedStation.location) return 'Chưa có địa điểm';
                        const loc = typeof selectedStation.location === 'string' 
                          ? JSON.parse(selectedStation.location) 
                          : selectedStation.location;
                    if (loc.address) {
                      return `${loc.address}${loc.district ? ', ' + loc.district : ''}${loc.city ? ', ' + loc.city : ''}`;
                    }
                    return loc.location || JSON.stringify(loc);
                  } catch {
                        return selectedStation.location || 'Chưa có địa điểm';
                  }
                })()}
                  </p>
            </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Trạng thái:</strong>
                  <div style={{ marginTop: '5px' }}>{getStatusBadge(selectedStation.status)}</div>
            </div>
                {selectedStation.rating && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Đánh giá:</strong>
                    <p style={{ marginTop: '5px', color: '#6b7280' }}>
                  <i className="fas fa-star" style={{ color: '#fbbf24' }}></i>
                      {selectedStation.rating.toFixed(1)}
                    </p>
              </div>
            )}
          </div>

              <div>
                <strong>Điểm sạc ({stationChargers.length}):</strong>
                {stationChargers.length === 0 ? (
                  <p style={{ marginTop: '10px', color: '#6b7280' }}>Chưa có điểm sạc nào</p>
                ) : (
                  <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {stationChargers.map((charger) => (
                      <div key={charger.chargerId} style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{charger.chargerCode}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>{charger.chargerType}</div>
                        <div>{getChargerStatusBadge(charger.status)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setShowDetailModal(false); setSelectedStation(null); setStationChargers([]); }}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Station Modal */}
      {showEditModal && selectedStation && (
        <div className="modal-overlay" onClick={() => { setShowEditModal(false); setSelectedStation(null); setEditFormData({}); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-edit" style={{ marginRight: '10px', color: '#3b82f6' }}></i>
                Chỉnh sửa Trạm Sạc
              </h3>
              <button className="modal-close" onClick={() => { setShowEditModal(false); setSelectedStation(null); setEditFormData({}); }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mã trạm:</label>
                <input
                  type="text"
                  value={editFormData.stationCode}
                  onChange={(e) => setEditFormData({ ...editFormData, stationCode: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tên trạm:</label>
                <input
                  type="text"
                  value={editFormData.stationName}
                  onChange={(e) => setEditFormData({ ...editFormData, stationName: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
                </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Địa điểm (JSON):</label>
                <textarea
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  rows={3}
                  placeholder='{"address": "...", "district": "...", "city": "..."}'
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px' }}
                />
                      </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Trạng thái:</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                >
                  <option value="online">Hoạt động</option>
                  <option value="offline">Offline</option>
                  <option value="maintenance">Bảo trì</option>
                  <option value="closed">Đóng cửa</option>
                </select>
                    </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mô tả:</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
                      </div>
                    </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setShowEditModal(false); setSelectedStation(null); setEditFormData({}); }}>
                Hủy
                      </button>
              <button className="btn-primary" onClick={handleSaveEdit}>
                <i className="fas fa-save"></i> Lưu
                      </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationsManagement;
