// src/components/staff/SessionManagement.jsx
import React, { useState, useEffect } from 'react';
import { getAllStations } from '../../services/stationService';
import apiClient from '../../config/api';
import PaymentMethodModal from '../PaymentMethodModal';
import '../../styles/StaffSessionManagement.css';

const SessionManagement = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [stations, setStations] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completedSession, setCompletedSession] = useState(null);

  // Filters
  const [stationFilter, setStationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Start session form
  const [startForm, setStartForm] = useState({
    userId: '',
    stationId: '',
    chargerId: '',
  });

  useEffect(() => {
    fetchData();
    // Auto refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sessions, stationFilter, statusFilter, searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      let sessionsList = [];
      let stationsList = [];

      // Fetch sessions - chỉ lấy sessions đang hoạt động (không lấy completed/cancelled)
      try {
        const sessionsResponse = await apiClient.get('/sessions').catch(() => ({ data: [] }));
        const allSessions = Array.isArray(sessionsResponse.data) ? sessionsResponse.data : [];
        
        // Filter: Chỉ giữ lại sessions đang hoạt động (charging, reserved, starting)
        // Bỏ qua: completed, cancelled (admin có thể xem trong reports nếu cần)
        sessionsList = allSessions.filter(session => {
          const status = (session.sessionStatus || '').toLowerCase();
          return status !== 'completed' && status !== 'cancelled';
        });
        
        console.log(`📊 Filtered ${allSessions.length} sessions → ${sessionsList.length} active sessions`);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        sessionsList = [];
      }

      // Fetch stations
      try {
        const stationsData = await getAllStations().catch(() => []);
        // getAllStations() returns data directly
        if (Array.isArray(stationsData)) {
          stationsList = stationsData;
        } else if (stationsData && Array.isArray(stationsData.data)) {
          stationsList = stationsData.data;
        }
      } catch (err) {
        console.error('Error fetching stations:', err);
        stationsList = [];
      }

      // Sort by startTime descending
      sessionsList.sort((a, b) => {
        const timeA = a.startTime ? new Date(a.startTime).getTime() : 0;
        const timeB = b.startTime ? new Date(b.startTime).getTime() : 0;
        return timeB - timeA;
      });

      setSessions(sessionsList);
      setStations(stationsList);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...sessions];

    // Station filter
    if (stationFilter !== 'all') {
      filtered = filtered.filter(s => 
        String(s.stationId) === stationFilter
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => {
        const status = s.sessionStatus?.toLowerCase() || '';
        return status === statusFilter.toLowerCase();
      });
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.sessionCode?.toLowerCase().includes(query) ||
        String(s.sessionId)?.includes(query) ||
        String(s.userId)?.includes(query)
      );
    }

    setFilteredSessions(filtered);
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!startForm.userId || !startForm.stationId || !startForm.chargerId) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setActionLoading('start');
      const response = await apiClient.post('/sessions/start', {
        userId: parseInt(startForm.userId),
        stationId: parseInt(startForm.stationId),
        chargerId: parseInt(startForm.chargerId),
      });

      alert('✅ Đã khởi động phiên sạc thành công!');
      setShowStartModal(false);
      setStartForm({ userId: '', stationId: '', chargerId: '' });
      fetchData();
    } catch (error) {
      console.error('Error starting session:', error);
      alert(`❌ ${error.response?.data?.message || error.message || 'Không thể khởi động phiên sạc'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStopSession = async (sessionId) => {
    if (!confirm('Bạn có chắc chắn muốn dừng phiên sạc này? Driver sẽ được yêu cầu chọn phương thức thanh toán.')) {
      return;
    }

    try {
      setActionLoading(sessionId);
      const response = await apiClient.post(`/sessions/${sessionId}/stop`);
      
      if (response.data) {
        // Set completed session and show payment modal
        setCompletedSession({
          ...response.data,
          sessionId: response.data.sessionId || sessionId
        });
        setShowPaymentModal(true);
      }
      
      fetchData();
    } catch (error) {
      console.error('Error stopping session:', error);
      alert(`❌ ${error.response?.data?.message || error.message || 'Không thể dừng phiên sạc'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePaymentSuccess = (paymentResult) => {
    const methodName = paymentResult.paymentMethod === 'wallet' ? 'Ví điện tử' : 'Tiền mặt';
    const statusMsg = paymentResult.paymentStatus === 'pending' 
        ? '\n⚠️ Lưu ý: Thanh toán bằng tiền mặt cần nhân viên xác nhận đã thu tiền.'
        : '';
    
    alert(`✅ ${paymentResult.paymentStatus === 'pending' ? 'Yêu cầu thanh toán đã được ghi nhận!' : 'Thanh toán thành công!'}\n\n` +
          `Phương thức: ${methodName}\n` +
          `Số tiền: ${new Intl.NumberFormat('vi-VN').format(paymentResult.amount || 0)} ₫${statusMsg}`);
    
    setShowPaymentModal(false);
    setCompletedSession(null);
    fetchData();
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    setCompletedSession(null);
    fetchData();
  };

  const handleCancelSession = async (sessionId) => {
    if (!confirm('Bạn có chắc chắn muốn hủy phiên sạc này?')) {
      return;
    }

    try {
      setActionLoading(sessionId);
      await apiClient.post(`/sessions/${sessionId}/cancel`);
      alert('✅ Đã hủy phiên sạc thành công!');
      fetchData();
    } catch (error) {
      console.error('Error cancelling session:', error);
      alert(`❌ ${error.response?.data?.message || error.message || 'Không thể hủy phiên sạc'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = async (sessionId) => {
    try {
      const response = await apiClient.get(`/sessions/${sessionId}`);
      setSelectedSession(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching session details:', error);
      alert('Không thể tải thông tin chi tiết phiên sạc');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'charging': { label: 'Đang sạc', color: '#3b82f6', bg: '#dbeafe' },
      'CHARGING': { label: 'Đang sạc', color: '#3b82f6', bg: '#dbeafe' },
      'completed': { label: 'Hoàn thành', color: '#10b981', bg: '#d1fae5' },
      'COMPLETED': { label: 'Hoàn thành', color: '#10b981', bg: '#d1fae5' },
      'cancelled': { label: 'Đã hủy', color: '#ef4444', bg: '#fee2e2' },
      'CANCELLED': { label: 'Đã hủy', color: '#ef4444', bg: '#fee2e2' },
      'reserved': { label: 'Đã đặt chỗ', color: '#f59e0b', bg: '#fef3c7' },
      'RESERVED': { label: 'Đã đặt chỗ', color: '#f59e0b', bg: '#fef3c7' },
    };
    const statusLower = status?.toLowerCase() || '';
    const config = statusMap[statusLower] || statusMap[status] || { label: status, color: '#64748b', bg: '#f1f5f9' };
    return (
      <span className="status-badge" style={{ color: config.color, background: config.bg }}>
        {config.label}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime) return 'N/A';
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} phút`;
    }
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  const getStationName = (stationId) => {
    const station = stations.find(s => s.stationId === stationId || s.id === stationId);
    return station?.stationName || station?.stationCode || `Trạm #${stationId}`;
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="session-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="session-management">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Quản lý Phiên sạc</h2>
          <p>Khởi động và dừng các phiên sạc tại trạm</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowStartModal(true)}>
            <i className="fas fa-play"></i>
            Khởi động phiên sạc
          </button>
          <button className="btn-secondary" onClick={fetchData}>
            <i className="fas fa-refresh"></i>
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats Summary - Only Active Sessions */}
      <div className="stats-summary">
        <div className="stat-item">
          <div className="stat-value">{sessions.length}</div>
          <div className="stat-label">Phiên đang hoạt động</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#3b82f6' }}>
            {sessions.filter(s => {
              const status = s.sessionStatus?.toLowerCase() || '';
              return status === 'charging';
            }).length}
          </div>
          <div className="stat-label">Đang sạc</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#f59e0b' }}>
            {sessions.filter(s => {
              const status = s.sessionStatus?.toLowerCase() || '';
              return status === 'reserved' || status === 'starting';
            }).length}
          </div>
          <div className="stat-label">Chờ bắt đầu</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#8b5cf6' }}>
            {sessions.filter(s => {
              const status = s.sessionStatus?.toLowerCase() || '';
              return status === 'paused';
            }).length}
          </div>
          <div className="stat-label">Tạm dừng</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <label>
              <i className="fas fa-charging-station"></i>
              Lọc theo trạm
            </label>
            <select
              className="filter-select"
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
            >
              <option value="all">Tất cả trạm</option>
              {stations.map(station => (
                <option key={station.stationId || station.id} value={station.stationId || station.id}>
                  {station.stationName || station.stationCode}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>
              <i className="fas fa-filter"></i>
              Lọc theo trạng thái
            </label>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả đang hoạt động</option>
              <option value="charging">Đang sạc</option>
              <option value="reserved">Đã đặt chỗ</option>
              <option value="starting">Đang khởi động</option>
              <option value="paused">Tạm dừng</option>
            </select>
          </div>

          <div className="filter-group filter-search">
            <label>
              <i className="fas fa-search"></i>
              Tìm kiếm
            </label>
            <input
              type="text"
              className="search-input"
              placeholder="Mã phiên, ID phiên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="sessions-table-container">
        <table className="sessions-table">
          <thead>
            <tr>
              <th>Mã phiên</th>
              <th>User ID</th>
              <th>Trạm sạc</th>
              <th>Điểm sạc</th>
              <th>Thời gian bắt đầu</th>
              <th>Thời gian kết thúc</th>
              <th>Thời lượng</th>
              <th>Năng lượng (kWh)</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data-cell">
                  <i className="fas fa-inbox"></i>
                  <p>Không có phiên sạc nào</p>
                </td>
              </tr>
            ) : (
              filteredSessions.map((session) => {
                const isCharging = (session.sessionStatus?.toLowerCase() === 'charging');
                return (
                  <tr key={session.sessionId}>
                    <td>
                      <strong>{session.sessionCode || `#${session.sessionId}`}</strong>
                    </td>
                    <td>{session.userId}</td>
                    <td>{getStationName(session.stationId)}</td>
                    <td>#{session.chargerId}</td>
                    <td>{formatDateTime(session.startTime)}</td>
                    <td>{formatDateTime(session.endTime)}</td>
                    <td>{formatDuration(session.startTime, session.endTime)}</td>
                    <td>
                      {session.energyConsumed 
                        ? parseFloat(session.energyConsumed).toFixed(2) 
                        : '-'}
                    </td>
                    <td>{getStatusBadge(session.sessionStatus)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-view"
                          onClick={() => handleViewDetails(session.sessionId)}
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {isCharging && (
                          <button
                            className="btn-stop"
                            onClick={() => handleStopSession(session.sessionId)}
                            disabled={actionLoading === session.sessionId}
                            title="Dừng phiên sạc"
                          >
                            {actionLoading === session.sessionId ? (
                              <span className="spinner-small"></span>
                            ) : (
                              <i className="fas fa-stop"></i>
                            )}
                          </button>
                        )}
                        {(isCharging || session.sessionStatus?.toLowerCase() === 'reserved') && (
                          <button
                            className="btn-cancel"
                            onClick={() => handleCancelSession(session.sessionId)}
                            disabled={actionLoading === session.sessionId}
                            title="Hủy phiên sạc"
                          >
                            {actionLoading === session.sessionId ? (
                              <span className="spinner-small"></span>
                            ) : (
                              <i className="fas fa-times"></i>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Start Session Modal */}
      {showStartModal && (
        <div className="modal-overlay" onClick={() => !actionLoading && setShowStartModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-play"></i>
                Khởi động Phiên sạc
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowStartModal(false)}
                disabled={actionLoading}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleStartSession} className="start-session-form">
              <div className="form-field">
                <label>
                  User ID <span className="required">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={startForm.userId}
                  onChange={(e) => setStartForm({ ...startForm, userId: e.target.value })}
                  required
                  disabled={actionLoading}
                  placeholder="Nhập ID người dùng"
                />
              </div>
              <div className="form-field">
                <label>
                  Trạm sạc <span className="required">*</span>
                </label>
                <select
                  className="form-control"
                  value={startForm.stationId}
                  onChange={(e) => {
                    setStartForm({ ...startForm, stationId: e.target.value, chargerId: '' });
                  }}
                  required
                  disabled={actionLoading}
                >
                  <option value="">Chọn trạm sạc</option>
                  {stations.map(station => (
                    <option key={station.stationId || station.id} value={station.stationId || station.id}>
                      {station.stationName || station.stationCode}
                    </option>
                  ))}
                </select>
              </div>
              {startForm.stationId && (
                <div className="form-field">
                  <label>
                    Điểm sạc <span className="required">*</span>
                  </label>
                  <select
                    className="form-control"
                    value={startForm.chargerId}
                    onChange={(e) => setStartForm({ ...startForm, chargerId: e.target.value })}
                    required
                    disabled={actionLoading}
                  >
                    <option value="">Chọn điểm sạc</option>
                    {(() => {
                      const station = stations.find(s => 
                        String(s.stationId || s.id) === String(startForm.stationId)
                      );
                      const chargers = station?.chargers || [];
                      return chargers.map(charger => (
                        <option key={charger.chargerId || charger.id} value={charger.chargerId || charger.id}>
                          {charger.chargerCode || `Điểm sạc #${charger.chargerId || charger.id}`}
                          {charger.status && ` (${charger.status})`}
                        </option>
                      ));
                    })()}
                  </select>
                </div>
              )}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowStartModal(false)}
                  disabled={actionLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner-small"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-play"></i>
                      Khởi động
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      {showDetailsModal && selectedSession && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-info-circle"></i>
                Chi tiết Phiên sạc
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowDetailsModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="session-details-content">
              <div className="detail-section">
                <h4>Thông tin cơ bản</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Mã phiên</label>
                    <div>{selectedSession.sessionCode || `#${selectedSession.sessionId}`}</div>
                  </div>
                  <div className="detail-item">
                    <label>User ID</label>
                    <div>{selectedSession.userId}</div>
                  </div>
                  <div className="detail-item">
                    <label>Trạm sạc</label>
                    <div>{getStationName(selectedSession.stationId)}</div>
                  </div>
                  <div className="detail-item">
                    <label>Điểm sạc</label>
                    <div>#{selectedSession.chargerId}</div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Thời gian</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Thời gian bắt đầu</label>
                    <div>{formatDateTime(selectedSession.startTime)}</div>
                  </div>
                  <div className="detail-item">
                    <label>Thời gian kết thúc</label>
                    <div>{formatDateTime(selectedSession.endTime) || 'Đang sạc...'}</div>
                  </div>
                  <div className="detail-item">
                    <label>Thời lượng</label>
                    <div>{formatDuration(selectedSession.startTime, selectedSession.endTime)}</div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Thông tin sạc</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Năng lượng tiêu thụ</label>
                    <div>
                      {selectedSession.energyConsumed 
                        ? `${parseFloat(selectedSession.energyConsumed).toFixed(2)} kWh`
                        : '-'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Trạng thái</label>
                    <div>{getStatusBadge(selectedSession.sessionStatus)}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Đóng
              </button>
              {(selectedSession.sessionStatus?.toLowerCase() === 'charging') && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleStopSession(selectedSession.sessionId);
                  }}
                  disabled={actionLoading === selectedSession.sessionId}
                >
                  {actionLoading === selectedSession.sessionId ? (
                    <>
                      <span className="spinner-small"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-stop"></i>
                      Dừng phiên sạc
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Modal for staff-stopped sessions */}
      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={handlePaymentModalClose}
        session={completedSession}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default SessionManagement;
