// src/components/staff/OnSitePayment.jsx
import React, { useState, useEffect } from 'react';
import { getAllStations } from '../../services/stationService';
import apiClient from '../../config/api';
import '../../styles/StaffOnSitePayment.css';

const OnSitePayment = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [stations, setStations] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [pendingCashPayments, setPendingCashPayments] = useState([]);
  const [loadingPendingPayments, setLoadingPendingPayments] = useState(false);

  // Filters
  const [stationFilter, setStationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all'); // unpaid, paid, all

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'cash',
    amount: '',
  });

  useEffect(() => {
    fetchData();
    fetchPendingCashPayments();
    // Auto refresh every 10 seconds
    const interval = setInterval(() => {
      fetchData();
      fetchPendingCashPayments();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingCashPayments = async () => {
    try {
      setLoadingPendingPayments(true);
      const response = await apiClient.get('/payments/staff/pending-cash');
      setPendingCashPayments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching pending cash payments:', err);
      setPendingCashPayments([]);
    } finally {
      setLoadingPendingPayments(false);
    }
  };

  const handleConfirmCashPayment = async (paymentId) => {
    if (!confirm(`Xác nhận đã thu tiền cho thanh toán #${paymentId}?`)) {
      return;
    }

    try {
      setActionLoading(`confirm-${paymentId}`);
      const response = await apiClient.post(`/payments/${paymentId}/confirm`);
      
      if (response.data) {
        alert('✅ Đã xác nhận thanh toán thành công!');
        // Refresh data
        fetchPendingCashPayments();
        fetchData();
      }
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || err.message || 'Không thể xác nhận thanh toán'}`);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [sessions, stationFilter, statusFilter, paymentFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      let sessionsList = [];
      let stationsList = [];

      // Fetch sessions
      try {
        const sessionsResponse = await apiClient.get('/sessions').catch(() => ({ data: [] }));
        sessionsList = Array.isArray(sessionsResponse.data) ? sessionsResponse.data : [];
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

          // Fetch payment status for each session
          const sessionsWithPayments = await Promise.all(
            sessionsList.map(async (session) => {
              try {
                // Check if session has payment using correct endpoint
                const paymentsResponse = await apiClient.get(`/payments/session/${session.sessionId}`)
                  .catch((err) => {
                    console.warn(`No payments found for session ${session.sessionId}:`, err);
                    return { data: [] };
                  });
                const payments = Array.isArray(paymentsResponse.data) ? paymentsResponse.data : [];
                const isPaid = payments.some(p => {
                  const status = p.paymentStatus?.toLowerCase() || '';
                  return status === 'completed';
                });
                return {
                  ...session,
                  payments,
                  hasPayment: payments.length > 0,
                  isPaid,
                };
              } catch (error) {
                console.warn(`Error fetching payments for session ${session.sessionId}:`, error);
                return {
                  ...session,
                  payments: [],
                  hasPayment: false,
                  isPaid: false,
                };
              }
            })
          );

      setSessions(sessionsWithPayments);
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

    // Payment filter
    if (paymentFilter === 'unpaid') {
      filtered = filtered.filter(s => !s.isPaid && (s.sessionStatus?.toLowerCase() === 'completed'));
    } else if (paymentFilter === 'paid') {
      filtered = filtered.filter(s => s.isPaid);
    }

    setFilteredSessions(filtered);
  };

  const calculateChargeAmount = (session) => {
    if (!session.energyConsumed) return 0;
    // Backend default: 3,000 VND/kWh (from ProcessPaymentRequestDto)
    // Frontend uses 5,000 VND/kWh for display, but actual calculation should match backend
    const pricePerKwh = 5000; // VND per kWh - TODO: Get from backend config
    return parseFloat(session.energyConsumed) * pricePerKwh;
  };

  const handleProcessPayment = async (session) => {
    setSelectedSession(session);
    const amount = calculateChargeAmount(session);
    setPaymentForm({
      paymentMethod: 'cash',
      amount: amount.toFixed(0),
    });
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selectedSession) return;

    const amount = parseFloat(paymentForm.amount);
    if (!amount || amount <= 0) {
      alert('Số tiền không hợp lệ');
      return;
    }

    try {
      setActionLoading(true);
      
      // For completed sessions, create a payment record
      const paymentData = {
        sessionId: selectedSession.sessionId,
        userId: selectedSession.userId,
        amount: amount,
        paymentMethod: paymentForm.paymentMethod,
      };

      // If payment method is wallet, use existing payment API
      // For cash/QR/e_wallet, use onsite payment endpoint
      if (paymentForm.paymentMethod === 'wallet') {
        // Use process payment for session
        // Backend default pricePerKwh is 3000, but we calculate based on amount
        await apiClient.post('/payments/process', {
          sessionId: selectedSession.sessionId,
          userId: selectedSession.userId,
          energyConsumed: parseFloat(selectedSession.energyConsumed || 0),
          pricePerKwh: amount / parseFloat(selectedSession.energyConsumed || 1), // Calculate from amount
        });
      } else {
        // For cash/QR/e_wallet payment, use onsite endpoint
        await apiClient.post('/payments/onsite', paymentData);
      }

      alert('✅ Thanh toán thành công!');
      setShowPaymentModal(false);
      setSelectedSession(null);
      fetchData();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert(`❌ ${error.response?.data?.message || error.message || 'Không thể xử lý thanh toán'}`);
    } finally {
      setActionLoading(null);
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
    };
    const statusLower = status?.toLowerCase() || '';
    const config = statusMap[statusLower] || statusMap[status] || { label: status, color: '#64748b', bg: '#f1f5f9' };
    return (
      <span className="status-badge" style={{ color: config.color, background: config.bg }}>
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (isPaid) => {
    if (isPaid) {
      return (
        <span className="payment-badge paid">
          <i className="fas fa-check-circle"></i>
          Đã thanh toán
        </span>
      );
    }
    return (
      <span className="payment-badge unpaid">
        <i className="fas fa-exclamation-circle"></i>
        Chưa thanh toán
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStationName = (stationId) => {
    const station = stations.find(s => s.stationId === stationId || s.id === stationId);
    return station?.stationName || station?.stationCode || `Trạm #${stationId}`;
  };

  // Stats
  const unpaidSessions = sessions.filter(s => 
    !s.isPaid && (s.sessionStatus?.toLowerCase() === 'completed')
  );
  const totalUnpaidAmount = unpaidSessions.reduce((sum, s) => {
    return sum + calculateChargeAmount(s);
  }, 0);

  if (loading && sessions.length === 0) {
    return (
      <div className="onsite-payment">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="onsite-payment">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Thanh toán tại chỗ</h2>
          <p>Xử lý thanh toán cho các phiên sạc đã hoàn thành</p>
        </div>
        <button className="btn-secondary" onClick={fetchData}>
          <i className="fas fa-refresh"></i>
          Làm mới
        </button>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-item">
          <div className="stat-value">{unpaidSessions.length}</div>
          <div className="stat-label">Phiên chưa thanh toán</div>
        </div>
        <div className="stat-item highlight">
          <div className="stat-value" style={{ color: '#ef4444' }}>
            {formatCurrency(totalUnpaidAmount)}
          </div>
          <div className="stat-label">Tổng tiền cần thu</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#10b981' }}>
            {sessions.filter(s => s.isPaid).length}
          </div>
          <div className="stat-label">Phiên đã thanh toán</div>
        </div>
        <div className="stat-item" style={{ background: '#fff3cd', border: '2px solid #ffc107' }}>
          <div className="stat-value" style={{ color: '#f59e0b' }}>
            {pendingCashPayments.length}
          </div>
          <div className="stat-label">Thanh toán tiền mặt cần xác nhận</div>
        </div>
      </div>

      {/* Pending Cash Payments Section */}
      {pendingCashPayments.length > 0 && (
        <div className="pending-payments-section">
          <div className="section-header">
            <h3>
              <i className="fas fa-clock" style={{ color: '#f59e0b' }}></i>
              Thanh toán tiền mặt chờ xác nhận ({pendingCashPayments.length})
            </h3>
            <button 
              className="btn-refresh-small"
              onClick={fetchPendingCashPayments}
              disabled={loadingPendingPayments}
            >
              <i className={`fas fa-refresh ${loadingPendingPayments ? 'fa-spin' : ''}`}></i>
            </button>
          </div>
          <div className="pending-payments-list">
            {pendingCashPayments.map(payment => (
              <div key={payment.paymentId} className="pending-payment-card">
                <div className="payment-info">
                  <div className="payment-header-info">
                    <strong>Mã thanh toán: #{payment.paymentId}</strong>
                    <span className="badge-pending">Chờ xác nhận</span>
                  </div>
                  <div className="payment-details">
                    <div>
                      <span className="detail-label">Phiên sạc:</span>
                      <span>#{payment.sessionId}</span>
                    </div>
                    <div>
                      <span className="detail-label">Người dùng:</span>
                      <span>User #{payment.userId}</span>
                    </div>
                    <div>
                      <span className="detail-label">Số tiền:</span>
                      <strong style={{ color: '#ef4444', fontSize: '16px' }}>
                        {formatCurrency(payment.amount)}
                      </strong>
                    </div>
                    <div>
                      <span className="detail-label">Thời gian:</span>
                      <span>{formatDateTime(payment.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="payment-actions">
                  <button
                    className="btn-confirm-payment"
                    onClick={() => handleConfirmCashPayment(payment.paymentId)}
                    disabled={actionLoading === `confirm-${payment.paymentId}`}
                  >
                    {actionLoading === `confirm-${payment.paymentId}` ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle"></i>
                        Xác nhận đã thu tiền
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
              <option value="all">Tất cả</option>
              <option value="completed">Hoàn thành</option>
              <option value="charging">Đang sạc</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              <i className="fas fa-money-bill"></i>
              Lọc theo thanh toán
            </label>
            <select
              className="filter-select"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="unpaid">Chưa thanh toán</option>
              <option value="paid">Đã thanh toán</option>
            </select>
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
              <th>Thời gian hoàn thành</th>
              <th>Năng lượng (kWh)</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
              <th>Thanh toán</th>
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
                const chargeAmount = calculateChargeAmount(session);
                const isCompleted = session.sessionStatus?.toLowerCase() === 'completed';
                const canPay = isCompleted && !session.isPaid;

                return (
                  <tr key={session.sessionId}>
                    <td>
                      <strong>{session.sessionCode || `#${session.sessionId}`}</strong>
                    </td>
                    <td>{session.userId}</td>
                    <td>{getStationName(session.stationId)}</td>
                    <td>#{session.chargerId}</td>
                    <td>{formatDateTime(session.endTime || session.startTime)}</td>
                    <td>
                      {session.energyConsumed 
                        ? parseFloat(session.energyConsumed).toFixed(2) 
                        : '-'}
                    </td>
                    <td>
                      <strong style={{ color: '#ef4444' }}>
                        {formatCurrency(chargeAmount)}
                      </strong>
                    </td>
                    <td>{getStatusBadge(session.sessionStatus)}</td>
                    <td>{getPaymentBadge(session.isPaid)}</td>
                    <td>
                      {canPay ? (
                        <button
                          className="btn-pay"
                          onClick={() => handleProcessPayment(session)}
                          title="Xử lý thanh toán"
                        >
                          <i className="fas fa-cash-register"></i>
                          Thanh toán
                        </button>
                      ) : (
                        <span className="no-action">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedSession && (
        <div className="modal-overlay" onClick={() => !actionLoading && setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-cash-register"></i>
                Xử lý Thanh toán
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowPaymentModal(false)}
                disabled={actionLoading}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="payment-summary">
              <div className="summary-item">
                <label>Mã phiên:</label>
                <div>{selectedSession.sessionCode || `#${selectedSession.sessionId}`}</div>
              </div>
              <div className="summary-item">
                <label>User ID:</label>
                <div>{selectedSession.userId}</div>
              </div>
              <div className="summary-item">
                <label>Năng lượng tiêu thụ:</label>
                <div>
                  {selectedSession.energyConsumed 
                    ? `${parseFloat(selectedSession.energyConsumed).toFixed(2)} kWh`
                    : '-'}
                </div>
              </div>
              <div className="summary-item highlight">
                <label>Tổng tiền:</label>
                <div className="amount-display">
                  {formatCurrency(calculateChargeAmount(selectedSession))}
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmitPayment} className="payment-form">
              <div className="form-field">
                <label>
                  Phương thức thanh toán <span className="required">*</span>
                </label>
                <select
                  className="form-control"
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  required
                  disabled={actionLoading}
                >
                  <option value="cash">Tiền mặt</option>
                  <option value="qr_payment">QR Code</option>
                  <option value="wallet">Ví điện tử</option>
                  <option value="e_wallet">E-Wallet (MoMo, ZaloPay...)</option>
                  <option value="banking">Chuyển khoản</option>
                  <option value="credit_card">Thẻ tín dụng</option>
                  <option value="debit_card">Thẻ ghi nợ</option>
                </select>
              </div>
              <div className="form-field">
                <label>
                  Số tiền <span className="required">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  required
                  disabled={actionLoading}
                  placeholder="Nhập số tiền"
                  min="0"
                  step="1000"
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowPaymentModal(false)}
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
                      <i className="fas fa-check"></i>
                      Xác nhận thanh toán
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnSitePayment;
