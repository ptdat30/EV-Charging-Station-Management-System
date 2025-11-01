// src/components/admin/ReservationsManagement.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../config/api';
import '../../styles/AdminReservationsManagement.css';

const ReservationsManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  useEffect(() => {
    fetchReservations();
    
    // Auto refresh every 10 seconds
    const interval = setInterval(fetchReservations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reservations, searchQuery, statusFilter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/reservations/admin/all');
      const data = Array.isArray(response.data) ? response.data : [];
      setReservations(data);
      console.log('✅ Loaded reservations:', data.length);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách đặt chỗ');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reservations];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(reservation =>
        String(reservation.reservationId || '').includes(query) ||
        String(reservation.userId || '').includes(query) ||
        String(reservation.stationId || '').includes(query) ||
        String(reservation.chargerId || '').includes(query) ||
        String(reservation.confirmationCode || '').toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(reservation => {
        const status = reservation.status?.toLowerCase();
        return status === statusFilter.toLowerCase();
      });
    }

    // Sort by time (newest first)
    filtered.sort((a, b) => {
      const timeA = a.reservedStartTime ? new Date(a.reservedStartTime).getTime() : 0;
      const timeB = b.reservedStartTime ? new Date(b.reservedStartTime).getTime() : 0;
      return timeB - timeA;
    });

    setFilteredReservations(filtered);
  };

  const handleCancelReservation = async (reservationId, reason) => {
    try {
      setActionLoading(reservationId);
      const response = await apiClient.put(`/reservations/admin/${reservationId}/cancel`, null, {
        params: { reason: reason || 'Cancelled by admin' }
      });
      
      if (response.data) {
        alert('✅ Đã hủy đặt chỗ thành công!');
        await fetchReservations();
        setShowCancelModal(false);
        setSelectedReservation(null);
        setCancelReason('');
      }
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      alert(`❌ ${err.response?.data?.message || err.message || 'Không thể hủy đặt chỗ'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const openCancelModal = (reservation) => {
    setSelectedReservation(reservation);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { label: 'Đã xác nhận', color: '#10b981', bg: '#d1fae5' },
      cancelled: { label: 'Đã hủy', color: '#ef4444', bg: '#fee2e2' },
      completed: { label: 'Hoàn thành', color: '#3b82f6', bg: '#dbeafe' },
      no_show: { label: 'Không đến', color: '#f59e0b', bg: '#fef3c7' },
      checked_in: { label: 'Đã check-in', color: '#8b5cf6', bg: '#ede9fe' }
    };
    const config = statusConfig[status?.toLowerCase()] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
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
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  };

  // Stats
  const activeReservations = reservations.filter(r => 
    r.status?.toLowerCase() === 'confirmed' || r.status?.toLowerCase() === 'checked_in'
  );
  const stuckReservations = reservations.filter(r => {
    const status = r.status?.toLowerCase();
    const isStuck = (status === 'confirmed' || status === 'checked_in') && 
                    r.reservedStartTime && 
                    new Date(r.reservedStartTime) < new Date(Date.now() - 24 * 60 * 60 * 1000); // > 24 hours old
    return isStuck;
  });

  if (loading && reservations.length === 0) {
    return (
      <div className="reservations-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách đặt chỗ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reservations-management">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Quản lý Đặt chỗ</h2>
          <p>Theo dõi và quản lý tất cả đặt chỗ trong hệ thống</p>
        </div>
        <button className="btn-secondary" onClick={fetchReservations}>
          <i className="fas fa-refresh"></i>
          Làm mới
        </button>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-item">
          <div className="stat-value">{reservations.length}</div>
          <div className="stat-label">Tổng số đặt chỗ</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#10b981' }}>
            {activeReservations.length}
          </div>
          <div className="stat-label">Đang hoạt động</div>
        </div>
        <div className="stat-item" style={{ background: '#fff3cd', border: '2px solid #ffc107' }}>
          <div className="stat-value" style={{ color: '#f59e0b' }}>
            {stuckReservations.length}
          </div>
          <div className="stat-label">Có thể bị treo</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#ef4444' }}>
            {reservations.filter(r => r.status?.toLowerCase() === 'cancelled').length}
          </div>
          <div className="stat-label">Đã hủy</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm theo ID, mã xác nhận, trạm, người dùng..."
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
          <option value="confirmed">Đã xác nhận</option>
          <option value="checked_in">Đã check-in</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
          <option value="no_show">Không đến</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchReservations}>
            Thử lại
          </button>
        </div>
      )}

      {/* Reservations Table */}
      {!error && (
        <div className="reservations-table-container">
          <table className="reservations-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Người dùng</th>
                <th>Trạm / Cổng</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Tiền cọc</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data-cell">
                    <i className="fas fa-inbox"></i>
                    <p>Không tìm thấy đặt chỗ nào</p>
                  </td>
                </tr>
              ) : (
                filteredReservations.map((reservation) => (
                  <tr key={reservation.reservationId}>
                    <td>
                      <span className="reservation-id">#{reservation.reservationId}</span>
                      {reservation.confirmationCode && (
                        <div className="confirmation-code">{reservation.confirmationCode}</div>
                      )}
                    </td>
                    <td>User #{reservation.userId}</td>
                    <td>
                      <div>Trạm: #{reservation.stationId}</div>
                      <div>Cổng: #{reservation.chargerId}</div>
                    </td>
                    <td>
                      <div><strong>Bắt đầu:</strong> {formatDateTime(reservation.reservedStartTime)}</div>
                      {reservation.reservedEndTime && (
                        <div><strong>Kết thúc:</strong> {formatDateTime(reservation.reservedEndTime)}</div>
                      )}
                      {reservation.durationMinutes && (
                        <div className="duration">Thời lượng: {reservation.durationMinutes} phút</div>
                      )}
                    </td>
                    <td>{getStatusBadge(reservation.status)}</td>
                    <td>
                      {reservation.depositAmount ? (
                        <div>
                          <strong>{formatCurrency(reservation.depositAmount)}</strong>
                          {reservation.depositRefunded && (
                            <div className="refunded-badge">Đã hoàn</div>
                          )}
                        </div>
                      ) : (
                        <span className="no-deposit">Không có</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {(reservation.status?.toLowerCase() === 'confirmed' || 
                          reservation.status?.toLowerCase() === 'checked_in') && (
                          <button
                            className="btn-action btn-cancel"
                            onClick={() => openCancelModal(reservation)}
                            disabled={actionLoading === reservation.reservationId}
                            title="Hủy đặt chỗ"
                          >
                            <i className="fas fa-times"></i>
                            Hủy
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedReservation && (
        <div className="modal-overlay" onClick={() => {
          setShowCancelModal(false);
          setSelectedReservation(null);
          setCancelReason('');
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Hủy đặt chỗ</h3>
              <button className="modal-close" onClick={() => {
                setShowCancelModal(false);
                setSelectedReservation(null);
                setCancelReason('');
              }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Mã đặt chỗ:</label>
                <div className="form-value">#{selectedReservation.reservationId}</div>
              </div>
              <div className="form-group">
                <label>Người dùng:</label>
                <div className="form-value">User #{selectedReservation.userId}</div>
              </div>
              <div className="form-group">
                <label>Lý do hủy:</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Nhập lý do hủy đặt chỗ (tùy chọn)..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedReservation(null);
                  setCancelReason('');
                }}
              >
                Hủy
              </button>
              <button
                className="btn-primary btn-danger"
                onClick={() => handleCancelReservation(selectedReservation.reservationId, cancelReason)}
                disabled={actionLoading === selectedReservation.reservationId}
              >
                {actionLoading === selectedReservation.reservationId ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i>
                    Xác nhận hủy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsManagement;

