// src/components/staff/OnSitePayment.jsx
import React, { useState, useEffect } from 'react';
import { getAllStations } from '../../services/stationService';
import apiClient from '../../config/api';
import ConfirmationModal from '../ConfirmationModal';
import AlertModal from '../AlertModal';
import { generateInvoice } from '../../utils/invoiceGenerator';
import '../../styles/StaffOnSitePayment.css';

const OnSitePayment = () => {
  const [sessionCode, setSessionCode] = useState('');
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState([]);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'cash',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [showConfirmPayment, setShowConfirmPayment] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    fetchStations();
    fetchAllSessions();
    // Auto refresh every 10 seconds
    const interval = setInterval(() => {
      fetchAllSessions();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessionCode, sessions]);

  const fetchStations = async () => {
    try {
      const stationsData = await getAllStations().catch(() => []);
      if (Array.isArray(stationsData)) {
        setStations(stationsData);
      } else if (stationsData && Array.isArray(stationsData.data)) {
        setStations(stationsData.data);
      }
    } catch (err) {
      console.error('Error fetching stations:', err);
      setStations([]);
    }
  };

  const fetchAllSessions = async () => {
    try {
      setLoading(true);
      const sessionsResponse = await apiClient.get('/sessions').catch(() => ({ data: [] }));
      let sessionsList = Array.isArray(sessionsResponse.data) ? sessionsResponse.data : [];
      
      // Sort by startTime descending
      sessionsList.sort((a, b) => {
        const timeA = a.startTime ? new Date(a.startTime).getTime() : 0;
        const timeB = b.startTime ? new Date(b.startTime).getTime() : 0;
        return timeB - timeA;
      });

      // Fetch payment status for each session
      const sessionsWithPayments = await Promise.all(
        sessionsList.map(async (session) => {
          try {
            const paymentsResponse = await apiClient.get(`/payments/session/${session.sessionId}`)
              .catch(() => ({ data: [] }));
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
      console.error('Error fetching sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = () => {
    if (!sessionCode.trim()) {
      setFilteredSessions(sessions);
      return;
    }

    const searchTerm = sessionCode.trim().toLowerCase();
    const filtered = sessions.filter(s => 
      s.sessionCode?.toLowerCase().includes(searchTerm) ||
      String(s.sessionId).includes(searchTerm) ||
      String(s.userId).includes(searchTerm)
    );
    
    setFilteredSessions(filtered);
  };

  const handleSelectSession = (session) => {
    // Check if session is completed
    if (session.sessionStatus?.toLowerCase() !== 'completed') {
      setAlertModal({
        isOpen: true,
        title: 'Phiên chưa hoàn thành',
        message: 'Phiên sạc này chưa hoàn thành. Chỉ có thể thanh toán cho phiên đã hoàn thành.',
        type: 'warning'
      });
      return;
    }

    // Check payment status
    if (session.isPaid) {
      setAlertModal({
        isOpen: true,
        title: 'Đã thanh toán',
        message: 'Phiên sạc này đã được thanh toán rồi.',
        type: 'info'
      });
      return;
    }

    setSelectedSession(session);
    setShowInvoiceModal(true);
  };

  const calculateChargeAmount = (session) => {
    if (!session.energyConsumed) return 0;
    const pricePerKwh = session.pricePerKwh || 3000;
    const amount = parseFloat(session.energyConsumed) * pricePerKwh;
    return amount;
  };

  const handleProcessPayment = async () => {
    if (!selectedSession) return;

    const amount = calculateChargeAmount(selectedSession);
    if (!amount || amount <= 0) {
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: 'Không thể tính toán số tiền thanh toán',
        type: 'error'
      });
      return;
    }

    try {
      setActionLoading(true);
      
      const paymentData = {
        sessionId: selectedSession.sessionId,
        userId: selectedSession.userId,
        amount: amount,
        paymentMethod: paymentForm.paymentMethod,
      };

      // If payment method is wallet, use existing payment API
      if (paymentForm.paymentMethod === 'wallet') {
        await apiClient.post('/payments/process', {
          sessionId: selectedSession.sessionId,
          userId: selectedSession.userId,
          energyConsumed: parseFloat(selectedSession.energyConsumed || 0),
          pricePerKwh: amount / parseFloat(selectedSession.energyConsumed || 1),
        });
      } else {
        // For cash/QR/e_wallet payment, use onsite endpoint
        await apiClient.post('/payments/onsite', paymentData);
      }

      setAlertModal({
        isOpen: true,
        title: 'Thành công',
        message: '✅ Thanh toán thành công!',
        type: 'success'
      });

      // Reset form
      setShowInvoiceModal(false);
      setSelectedSession(null);
      setPaymentForm({ paymentMethod: 'cash' });
      fetchAllSessions();
    } catch (error) {
      console.error('Error processing payment:', error);
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: `❌ ${error.response?.data?.message || error.message || 'Không thể xử lý thanh toán'}`,
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    if (!selectedSession) return;

    const amount = calculateChargeAmount(selectedSession);
    const station = stations.find(s => 
      s.stationId === selectedSession.stationId || s.id === selectedSession.stationId
    );

    const invoiceData = {
      sessionId: selectedSession.sessionId,
      sessionCode: selectedSession.sessionCode || `#${selectedSession.sessionId}`,
      stationId: selectedSession.stationId,
      chargerId: selectedSession.chargerId,
      startTime: selectedSession.startTime,
      endTime: selectedSession.endTime,
      energyConsumed: selectedSession.energyConsumed,
      paymentAmount: amount,
      paymentMethod: paymentForm.paymentMethod,
      sessionStatus: selectedSession.sessionStatus,
      isPayment: false,
      paymentId: null
    };

    generateInvoice(invoiceData);
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

  const calculateDuration = (start, end) => {
    if (!start || !end) return '-';
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diff = endDate - startDate;
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      return `${hours}h ${minutes}m`;
    } catch {
      return '-';
    }
  };

  const chargeAmount = selectedSession ? calculateChargeAmount(selectedSession) : 0;

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

  return (
    <div className="onsite-payment">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>
            <i className="fas fa-cash-register"></i>
            Thanh toán tại chỗ
          </h2>
          <p>Nhập mã phiên sạc để xử lý thanh toán</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="search-session-card">
        <div className="session-search-form">
          <div className="form-group">
            <label>
              <i className="fas fa-search"></i>
              Tìm kiếm phiên sạc
            </label>
            <input
              type="text"
              className="form-control"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
              placeholder="Nhập mã phiên, ID phiên hoặc User ID để lọc..."
              disabled={loading || actionLoading}
            />
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="sessions-list-card">
        <div className="sessions-header">
          <h3>
            <i className="fas fa-list"></i>
            Danh sách phiên sạc {sessionCode && `(${filteredSessions.length} kết quả)`}
          </h3>
          <button className="btn-refresh" onClick={fetchAllSessions} disabled={loading}>
            <i className={`fas fa-refresh ${loading ? 'fa-spin' : ''}`}></i>
            Làm mới
          </button>
        </div>

        {loading && sessions.length === 0 ? (
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Đang tải danh sách phiên sạc...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <p>{sessionCode ? 'Không tìm thấy phiên sạc nào' : 'Chưa có phiên sạc nào'}</p>
          </div>
        ) : (
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
                {filteredSessions.map((session) => {
                  const chargeAmount = calculateChargeAmount(session);
                  const isCompleted = session.sessionStatus?.toLowerCase() === 'completed';
                  const canPay = isCompleted && !session.isPaid;

                  return (
                    <tr key={session.sessionId} className={canPay ? 'can-pay-row' : ''}>
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
                            onClick={() => handleSelectSession(session)}
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
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {showInvoiceModal && selectedSession && (
        <div className="modal-overlay" onClick={() => !actionLoading && setShowInvoiceModal(false)}>
          <div className="invoice-details-card modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="invoice-header-section">
            <h3>
              <i className="fas fa-receipt"></i>
              Thông tin hóa đơn chi tiết
            </h3>
            <div className="header-actions">
              <button
                className="btn-print-invoice"
                onClick={handlePrintInvoice}
                title="In hóa đơn"
              >
                <i className="fas fa-print"></i>
                In hóa đơn
              </button>
              <button
                className="btn-close-modal"
                onClick={() => setShowInvoiceModal(false)}
                disabled={actionLoading}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div className="invoice-content">
            {/* Session Info */}
            <div className="invoice-section">
              <h4>
                <i className="fas fa-info-circle"></i>
                Thông tin phiên sạc
              </h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Mã phiên:</span>
                  <span className="info-value">
                    <strong>{selectedSession.sessionCode || `#${selectedSession.sessionId}`}</strong>
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">User ID:</span>
                  <span className="info-value">{selectedSession.userId}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Trạm sạc:</span>
                  <span className="info-value">{getStationName(selectedSession.stationId)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Điểm sạc:</span>
                  <span className="info-value">#{selectedSession.chargerId}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Thời gian bắt đầu:</span>
                  <span className="info-value">{formatDateTime(selectedSession.startTime)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Thời gian kết thúc:</span>
                  <span className="info-value">{formatDateTime(selectedSession.endTime)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Thời lượng sạc:</span>
                  <span className="info-value">
                    {calculateDuration(selectedSession.startTime, selectedSession.endTime)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Năng lượng tiêu thụ:</span>
                  <span className="info-value">
                    <strong>{parseFloat(selectedSession.energyConsumed || 0).toFixed(2)} kWh</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="invoice-section">
              <h4>
                <i className="fas fa-money-bill-wave"></i>
                Chi tiết thanh toán
              </h4>
              <div className="payment-details-table">
                <div className="payment-row">
                  <span className="payment-label">Năng lượng tiêu thụ:</span>
                  <span className="payment-value">
                    {parseFloat(selectedSession.energyConsumed || 0).toFixed(2)} kWh
                  </span>
                </div>
                <div className="payment-row">
                  <span className="payment-label">Đơn giá:</span>
                  <span className="payment-value">
                    {formatCurrency(selectedSession.pricePerKwh || 3000)}/kWh
                  </span>
                </div>
                <div className="payment-row total-row">
                  <span className="payment-label">Tổng tiền:</span>
                  <span className="payment-value total-amount">
                    {formatCurrency(chargeAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="invoice-section">
              <h4>
                <i className="fas fa-credit-card"></i>
                Phương thức thanh toán
              </h4>
              <div className="payment-methods-grid">
                {[
                  { value: 'cash', label: 'Tiền mặt', icon: 'fa-money-bill' },
                  { value: 'qr_payment', label: 'QR Code', icon: 'fa-qrcode' },
                  { value: 'wallet', label: 'Ví điện tử', icon: 'fa-wallet' },
                  { value: 'e_wallet', label: 'E-Wallet', icon: 'fa-mobile-alt' },
                  { value: 'banking', label: 'Chuyển khoản', icon: 'fa-university' },
                  { value: 'credit_card', label: 'Thẻ tín dụng', icon: 'fa-credit-card' },
                  { value: 'debit_card', label: 'Thẻ ghi nợ', icon: 'fa-credit-card' },
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`payment-method-option ${
                      paymentForm.paymentMethod === method.value ? 'selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={paymentForm.paymentMethod === method.value}
                      onChange={(e) => setPaymentForm({ paymentMethod: e.target.value })}
                      disabled={actionLoading}
                    />
                    <div className="method-content">
                      <i className={`fas ${method.icon}`}></i>
                      <span>{method.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="invoice-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowInvoiceModal(false);
                  setSelectedSession(null);
                  setPaymentForm({ paymentMethod: 'cash' });
                }}
                disabled={actionLoading}
              >
                <i className="fas fa-times"></i>
                Đóng
              </button>
              <button
                className="btn-primary btn-confirm-payment"
                onClick={() => setShowConfirmPayment(true)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle"></i>
                    Xác nhận thanh toán
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmPayment}
        onClose={() => setShowConfirmPayment(false)}
        onConfirm={() => {
          setShowConfirmPayment(false);
          handleProcessPayment();
        }}
        title="Xác nhận thanh toán"
        message={`Xác nhận thanh toán ${formatCurrency(chargeAmount)} cho phiên sạc ${selectedSession?.sessionCode || `#${selectedSession?.sessionId}`} bằng ${paymentForm.paymentMethod === 'cash' ? 'tiền mặt' : paymentForm.paymentMethod === 'wallet' ? 'ví điện tử' : paymentForm.paymentMethod}?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        type="info"
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
};

export default OnSitePayment;
