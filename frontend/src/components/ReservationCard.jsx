// src/components/ReservationCard.jsx
import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkInReservation, startSessionFromReservation, cancelReservation } from '../services/stationService';
import '../styles/ReservationCard.css';

const ReservationCard = ({ reservation, onUpdate, onError }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState('');
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('');
  const updatePendingRef = React.useRef(false);

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '-';
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateTimeStr;
    }
  };

  const formatTimeRemaining = (deadlineStr) => {
    if (!deadlineStr) return null;
    try {
      const deadline = new Date(deadlineStr);
      const now = new Date();
      const diff = deadline - now;
      
      if (diff < 0) return 'Đã quá hạn';
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) return `Còn ${hours} giờ ${minutes % 60} phút`;
      return `Còn ${minutes} phút`;
    } catch {
      return null;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ thanh toán',
      confirmed: 'Đã xác nhận',
      active: 'Đang hoạt động',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
      expired: 'Hết hạn',
      no_show: 'Không đến'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      active: 'status-active',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
      expired: 'status-expired',
      no_show: 'status-no-show'
    };
    return classes[status] || 'status-default';
  };

  // Memoize canCheckIn to prevent unnecessary recalculations
  const canCheckIn = useMemo(() => {
    if (!reservation.checkInDeadline) return false;
    if (reservation.isCheckedIn) return false;
    if (reservation.status !== 'confirmed') return false;
    
    const deadline = new Date(reservation.checkInDeadline);
    const now = new Date();
    const startTime = new Date(reservation.reservedStartTime);
    const earliestCheckIn = new Date(startTime.getTime() - 30 * 60 * 1000); // 30 phút trước
    
    return now >= earliestCheckIn && now <= deadline;
  }, [reservation.checkInDeadline, reservation.isCheckedIn, reservation.status, reservation.reservedStartTime]);

  const handleCheckIn = useCallback(async () => {
    if (!canCheckIn) {
      alert('Không thể check-in. Vui lòng kiểm tra thời gian check-in cho phép.');
      return;
    }

    if (!confirm('Xác nhận check-in? Bạn sẽ nhận lại tiền cọc khi check-in thành công.')) {
      return;
    }

    setActionLoading('checkin');
    try {
      const result = await checkInReservation(reservation.reservationId);
      alert(`✅ Check-in thành công!\nTiền cọc đã được hoàn lại vào ví.`);
      onUpdate && onUpdate();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Check-in thất bại';
      alert(`❌ ${errorMsg}`);
      onError && onError(errorMsg);
    } finally {
      setActionLoading('');
    }
  }, [canCheckIn, reservation.reservationId, onUpdate, onError]);

  const handleStartSession = useCallback(async () => {
    if (!confirm('Bắt đầu phiên sạc ngay bây giờ?')) return;
    
    setActionLoading('start');
    try {
      const session = await startSessionFromReservation(reservation.reservationId);
      alert('✅ Đã bắt đầu phiên sạc');
      onUpdate && onUpdate();
      // Navigate to charging live page
      navigate('/sessions/live');
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || err.message || 'Không thể bắt đầu phiên sạc'}`);
      onError && onError(err.message);
    } finally {
      setActionLoading('');
    }
  }, [reservation.reservationId, onUpdate, onError, navigate]);

  const handleCancelClick = useCallback(() => {
    setCancelReason('');
    setShowCancelModal(true);
  }, []);

  const actionLoadingRef = React.useRef('');
  
  const handleCancelConfirm = useCallback(async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy đặt chỗ.');
      return;
    }

    if (actionLoadingRef.current === 'cancel') {
      return; // Prevent double submission
    }

    actionLoadingRef.current = 'cancel';
    setActionLoading('cancel');
    
    try {
      console.log('Cancelling reservation:', reservation.reservationId, 'Reason:', cancelReason.trim());
      await cancelReservation(reservation.reservationId, cancelReason.trim());
      alert('✅ Đã hủy đặt chỗ thành công!');
      setShowCancelModal(false);
      setCancelReason('');
      actionLoadingRef.current = '';
      setActionLoading('');
      // Prevent multiple onUpdate calls
      if (!updatePendingRef.current && onUpdate) {
        updatePendingRef.current = true;
        // Delay onUpdate to prevent immediate re-render during hover
        setTimeout(() => {
          onUpdate();
          updatePendingRef.current = false;
        }, 200);
      }
    } catch (err) {
      console.error('Cancel reservation error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Không thể hủy đặt chỗ';
      alert(`❌ ${errorMsg}`);
      onError && onError(errorMsg);
      actionLoadingRef.current = '';
      setActionLoading('');
    }
  }, [cancelReason, reservation.reservationId, onUpdate, onError]);

  const handleCloseModal = useCallback(() => {
    setShowCancelModal(false);
    if (!actionLoading) {
      setCancelReason('');
    }
  }, [actionLoading]);

  return (
    <div className={`reservation-card ${getStatusClass(reservation.status)}`}>
      <div className="reservation-card-header">
        <div className="reservation-code">
          <i className="fas fa-calendar-check"></i>
          <div>
            <span className="code-label">Mã đặt chỗ:</span>
            <strong>{reservation.confirmationCode || reservation.reservationId}</strong>
          </div>
        </div>
        <span className={`reservation-status ${getStatusClass(reservation.status)}`}>
          {getStatusLabel(reservation.status)}
        </span>
      </div>

      <div className="reservation-card-body">
        <div className="reservation-info-row">
          <span className="info-icon">📍</span>
          <span className="info-label">Trạm sạc:</span>
          <span>ID {reservation.stationId}</span>
          {reservation.chargerId && (
            <>
              <span className="separator">•</span>
              <span className="info-label">Cổng:</span>
              <span>ID {reservation.chargerId}</span>
            </>
          )}
        </div>

        <div className="reservation-info-row">
          <span className="info-icon">🕐</span>
          <span className="info-label">Thời gian:</span>
          <span>{formatDateTime(reservation.reservedStartTime)}</span>
          <span className="separator">→</span>
          <span>{formatDateTime(reservation.reservedEndTime)}</span>
        </div>

        {reservation.durationMinutes && (
          <div className="reservation-info-row">
            <span className="info-icon">⏱️</span>
            <span className="info-label">Thời lượng:</span>
            <span>{reservation.durationMinutes} phút</span>
          </div>
        )}

        {reservation.depositAmount && (
          <div className="reservation-info-row highlight">
            <span className="info-icon">💰</span>
            <span className="info-label">Tiền cọc:</span>
            <span className="deposit-amount">
              {new Intl.NumberFormat('vi-VN').format(reservation.depositAmount)} ₫
              {reservation.depositRefunded && (
                <span className="deposit-refunded">✓ Đã hoàn</span>
              )}
            </span>
          </div>
        )}

        {reservation.checkInDeadline && !reservation.isCheckedIn && (
          <div className="reservation-info-row warning">
            <span className="info-icon">⏰</span>
            <span className="info-label">Hạn check-in:</span>
            <span className="checkin-deadline">
              {formatDateTime(reservation.checkInDeadline)}
              {canCheckIn && (
                <span className="checkin-remaining"> ({formatTimeRemaining(reservation.checkInDeadline)})</span>
              )}
            </span>
          </div>
        )}

        {reservation.isCheckedIn && (
          <div className="reservation-info-row success">
            <span className="info-icon">✓</span>
            <span>Đã check-in lúc: {formatDateTime(reservation.checkInTime)}</span>
          </div>
        )}

        {reservation.status === 'no_show' && reservation.noShowCount > 0 && (
          <div className="reservation-info-row error">
            <span className="info-icon">⚠️</span>
            <span>Số lần không đến: {reservation.noShowCount}</span>
          </div>
        )}
      </div>

      <div className="reservation-card-actions">
        {reservation.status === 'confirmed' && canCheckIn && (
          <button
            className="btn-checkin"
            onClick={handleCheckIn}
            disabled={loading || actionLoading === 'checkin'}
          >
            {actionLoading === 'checkin' ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Đang xử lý...
              </>
            ) : (
              <>
                <i className="fas fa-check-circle"></i> Check-in
              </>
            )}
          </button>
        )}

        {reservation.status === 'confirmed' && reservation.isCheckedIn && !reservation.sessionId && (
          <button
            className="btn-start"
            onClick={handleStartSession}
            disabled={loading || actionLoading === 'start'}
          >
            {actionLoading === 'start' ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Đang bắt đầu...
              </>
            ) : (
              <>
                <i className="fas fa-play"></i> Bắt đầu sạc
              </>
            )}
          </button>
        )}

        {reservation.status === 'active' && reservation.sessionId && (
          <button
            className="btn-view-live"
            onClick={() => navigate('/sessions/live')}
          >
            <i className="fas fa-tv"></i> Xem quá trình sạc
          </button>
        )}

        {/* Hiển thị nút hủy cho pending và confirmed (chưa check-in) */}
        {(reservation.status === 'pending' || 
          (reservation.status === 'confirmed' && !reservation.isCheckedIn)) && (
          <button
            className="btn-cancel"
            onClick={handleCancelClick}
            disabled={loading || actionLoading === 'cancel'}
            title="Hủy đặt chỗ này"
          >
            {actionLoading === 'cancel' ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Đang hủy...
              </>
            ) : (
              <>
                <i className="fas fa-times-circle"></i> Hủy đặt chỗ
              </>
            )}
          </button>
        )}

        {reservation.qrCode && (
          <button
            className="btn-qr"
            onClick={() => alert(`QR Code: ${reservation.qrCode}`)}
            title="Xem QR Code"
          >
            <i className="fas fa-qrcode"></i>
          </button>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="cancel-modal-overlay" onClick={handleCloseModal}>
          <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cancel-modal-header">
              <h3>
                <i className="fas fa-exclamation-triangle"></i>
                Xác nhận hủy đặt chỗ
              </h3>
              <button 
                className="cancel-modal-close"
                onClick={handleCloseModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="cancel-modal-body">
              <p className="cancel-warning">
                Bạn có chắc chắn muốn hủy đặt chỗ này?
              </p>
              <div className="cancel-info-box">
                <div className="cancel-info-item">
                  <span className="cancel-info-label">Mã đặt chỗ:</span>
                  <span className="cancel-info-value">
                    {reservation.confirmationCode || reservation.reservationId}
                  </span>
                </div>
                {reservation.depositAmount && (
                  <div className="cancel-info-item">
                    <span className="cancel-info-label">Tiền cọc:</span>
                    <span className="cancel-info-value deposit">
                      {new Intl.NumberFormat('vi-VN').format(reservation.depositAmount)} ₫
                    </span>
                  </div>
                )}
                <div className="cancel-info-item">
                  <span className="cancel-info-label">Thời gian đặt:</span>
                  <span className="cancel-info-value">
                    {formatDateTime(reservation.reservedStartTime)}
                  </span>
                </div>
              </div>
              <div className="cancel-reason-input">
                <label htmlFor="cancel-reason">
                  <i className="fas fa-comment"></i>
                  Lý do hủy đặt chỗ <span className="required">*</span>
                </label>
                <textarea
                  id="cancel-reason"
                  value={cancelReason}
                  onChange={(e) => {
                    setCancelReason(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey && cancelReason.trim()) {
                      handleCancelConfirm(e);
                    }
                  }}
                  placeholder="Nhập lý do hủy đặt chỗ (ví dụ: Thay đổi kế hoạch, Không còn cần sạc...)"
                  rows="3"
                  className="cancel-reason-textarea"
                  disabled={actionLoading === 'cancel'}
                  autoFocus
                />
              </div>
              <div className="cancel-notice">
                <i className="fas fa-info-circle"></i>
                <span>Lưu ý: Tiền cọc có thể không được hoàn lại tùy thuộc vào thời điểm hủy.</span>
              </div>
            </div>
            <div className="cancel-modal-footer">
              <button
                type="button"
                className="btn-cancel-secondary"
                onClick={handleCloseModal}
                disabled={actionLoading === 'cancel'}
              >
                <i className="fas fa-arrow-left"></i>
                Quay lại
              </button>
              <button
                type="button"
                className="btn-cancel-primary"
                onClick={handleCancelConfirm}
                disabled={!cancelReason.trim() || actionLoading === 'cancel'}
              >
                {actionLoading === 'cancel' ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang hủy...
                  </>
                ) : (
                  <>
                    <i className="fas fa-times-circle"></i>
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

// Custom comparison function to prevent unnecessary re-renders
const areEqual = (prevProps, nextProps) => {
  // Compare reservation by ID and status (most critical fields)
  if (prevProps.reservation.reservationId !== nextProps.reservation.reservationId) {
    return false;
  }
  if (prevProps.reservation.status !== nextProps.reservation.status) {
    return false;
  }
  if (prevProps.reservation.isCheckedIn !== nextProps.reservation.isCheckedIn) {
    return false;
  }
  if (prevProps.reservation.sessionId !== nextProps.reservation.sessionId) {
    return false;
  }
  // Compare function references (they should be stable due to useCallback)
  if (prevProps.onUpdate !== nextProps.onUpdate) {
    return false;
  }
  if (prevProps.onError !== nextProps.onError) {
    return false;
  }
  // If all critical fields are the same, prevent re-render
  return true;
};

export default React.memo(ReservationCard, areEqual);

