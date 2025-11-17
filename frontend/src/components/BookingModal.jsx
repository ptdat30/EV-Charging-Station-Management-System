// src/components/BookingModal.jsx
import React, { useState, useEffect } from 'react';
import { createReservation } from '../services/stationService';
import { useAuth } from '../context/AuthContext';
import AlertModal from './AlertModal';
import '../styles/BookingModal.css';

const BookingModal = ({ isOpen, onClose, station, chargerId = null, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quickBook, setQuickBook] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  
  // Helper function to format Date as local datetime string (YYYY-MM-DDTHH:mm:ss)
  const formatLocalDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  // Calculate minimum datetime (30 minutes from now)
  const getMinDateTime = () => {
    const minDate = new Date();
    minDate.setMinutes(minDate.getMinutes() + 30);
    // Format for datetime-local input (YYYY-MM-DDTHH:mm)
    const year = minDate.getFullYear();
    const month = String(minDate.getMonth() + 1).padStart(2, '0');
    const day = String(minDate.getDate()).padStart(2, '0');
    const hours = String(minDate.getHours()).padStart(2, '0');
    const minutes = String(minDate.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    chargerId: chargerId || '',
    reservedStartTime: '',
    durationMinutes: 60, // Default 60 minutes
  });

  useEffect(() => {
    if (isOpen) {
      // Set default start time to at least 1 hour from now (next hour, rounded up)
      const now = new Date();
      const defaultStart = new Date(now);
      // Set to next hour, at least 1 hour from now
      defaultStart.setHours(now.getHours() + 1, 0, 0, 0);
      
      // If less than 1 hour from now, add another hour
      if (defaultStart.getTime() - now.getTime() < 60 * 60 * 1000) {
        defaultStart.setHours(now.getHours() + 2, 0, 0, 0);
      }
      
      setFormData(prev => ({
        ...prev,
        reservedStartTime: formatLocalDateTime(defaultStart).slice(0, 16), // Format for datetime-local input
        chargerId: chargerId || prev.chargerId
      }));
    }
  }, [isOpen, chargerId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const calculateEndTime = (startTime, duration) => {
    if (!startTime) return null;
    const start = new Date(startTime);
    start.setMinutes(start.getMinutes() + duration);
    return start.toISOString(); // Return ISO string, will be formatted later
  };

  const handleQuickBook = async () => {
    if (!station || !station.id) {
      setError('Thông tin trạm không hợp lệ');
      return;
    }

    // Chỉ cho phép đặt chỗ khi trạm đang online (hoạt động)
    if (station.status !== 'online') {
      const statusMsg = station.status === 'maintenance' ? 'đang bảo trì' :
                       station.status === 'offline' ? 'tạm ngưng' :
                       station.status === 'closed' ? 'đã đóng cửa' : 'không khả dụng';
      setError(`Trạm ${statusMsg}. Không thể đặt chỗ hoặc sạc tại thời điểm này.`);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Quick book: Start time is next available slot (at least 1 hour from now)
      const now = new Date();
      const startDate = new Date(now);
      startDate.setHours(now.getHours() + 1, 0, 0, 0);
      
      // Ensure at least 1 hour from now
      if (startDate.getTime() - now.getTime() < 60 * 60 * 1000) {
        startDate.setHours(now.getHours() + 2, 0, 0, 0);
      }
      
      // Format as local time (YYYY-MM-DDTHH:mm:ss) without timezone conversion
      const startTime = formatLocalDateTime(startDate); // "2025-10-31T19:00:00"
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + 60);
      const endTime = formatLocalDateTime(endDate);

      const payload = {
        stationId: station.id,
        chargerId: chargerId || null, // Let backend assign available charger
        reservedStartTime: startTime,
        reservedEndTime: endTime,
        durationMinutes: 60
      };

      const result = await createReservation(payload);
      
      if (result) {
        const depositAmount = result.depositAmount ? new Intl.NumberFormat('vi-VN').format(result.depositAmount) : '0';
        setAlertModal({
          isOpen: true,
          title: 'Đặt chỗ thành công',
          message: `✅ Đặt chỗ thành công!\n\n` +
                   `Mã xác nhận: ${result.confirmationCode || result.reservationId}\n` +
                   `Thời gian: ${new Date(startTime).toLocaleString('vi-VN')}\n` +
                   `Tiền cọc: ${depositAmount} ₫\n\n` +
                   `⚠️ Lưu ý: Bạn cần check-in trong vòng 15 phút sau thời gian đặt để nhận lại tiền cọc.`,
          type: 'success'
        });
        onSuccess && onSuccess(result);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Đặt chỗ thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!station || !station.id) {
      setError('Thông tin trạm không hợp lệ');
      return;
    }

    // Chỉ cho phép đặt chỗ khi trạm đang online (hoạt động)
    if (station.status !== 'online') {
      const statusMsg = station.status === 'maintenance' ? 'đang bảo trì' :
                       station.status === 'offline' ? 'tạm ngưng' :
                       station.status === 'closed' ? 'đã đóng cửa' : 'không khả dụng';
      setError(`Trạm ${statusMsg}. Không thể đặt chỗ hoặc sạc tại thời điểm này.`);
      return;
    }

    if (!formData.reservedStartTime) {
      setError('Vui lòng chọn thời gian bắt đầu');
      return;
    }

    // Validate start time is in the future
    const startDate = new Date(formData.reservedStartTime);
    const now = new Date();
    if (startDate <= now) {
      setError('Thời gian bắt đầu phải là thời gian trong tương lai. Vui lòng chọn thời gian sau hiện tại.');
      return;
    }

    // Validate minimum advance time (at least 30 minutes from now)
    const minAdvanceTime = 30 * 60 * 1000; // 30 minutes in milliseconds
    if (startDate.getTime() - now.getTime() < minAdvanceTime) {
      setError('Thời gian bắt đầu phải cách hiện tại ít nhất 30 phút. Vui lòng chọn thời gian muộn hơn.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Format datetime as local time (YYYY-MM-DDTHH:mm:ss) without timezone conversion
      const startTime = formatLocalDateTime(startDate); // "2025-10-31T19:00:00"
      const endDate = calculateEndTime(formData.reservedStartTime, formData.durationMinutes);
      const endTime = endDate ? formatLocalDateTime(new Date(endDate)) : null;

      const payload = {
        stationId: station.id,
        chargerId: formData.chargerId || null,
        reservedStartTime: startTime,
        reservedEndTime: endTime,
        durationMinutes: formData.durationMinutes
      };

      const result = await createReservation(payload);
      
      if (result) {
        const depositAmount = result.depositAmount ? new Intl.NumberFormat('vi-VN').format(result.depositAmount) : '0';
        setAlertModal({
          isOpen: true,
          title: 'Đặt chỗ thành công',
          message: `✅ Đặt chỗ thành công!\n\n` +
                   `Mã xác nhận: ${result.confirmationCode || result.reservationId}\n` +
                   `Thời gian: ${new Date(startTime).toLocaleString('vi-VN')}\n` +
                   `Tiền cọc: ${depositAmount} ₫\n\n` +
                   `⚠️ Lưu ý: Bạn cần check-in trong vòng 15 phút sau thời gian đặt để nhận lại tiền cọc.`,
          type: 'success'
        });
        onSuccess && onSuccess(result);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Đặt chỗ thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="booking-modal-header">
          <h2>
            <i className="fas fa-calendar-check"></i>
            Đặt chỗ sạc xe điện
          </h2>
          <button className="booking-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="booking-modal-station-info">
          <h3>{station?.name || 'Trạm sạc'}</h3>
          <p>
            <i className="fas fa-map-marker-alt"></i>
            {station?.address || station?.location || ''}
          </p>
        </div>

        {error && (
          <div className="booking-modal-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {/* Quick Book Button */}
        <div className="booking-quick-book">
          <button 
            type="button"
            className="btn-quick-book"
            onClick={handleQuickBook}
            disabled={loading}
          >
            <i className="fas fa-bolt"></i>
            {loading ? 'Đang xử lý...' : 'Đặt chỗ nhanh (1 giờ tiếp theo)'}
          </button>
          <p className="quick-book-note">Đặt chỗ ngay cho khung giờ trống sớm nhất (1 giờ tới)</p>
        </div>

        <div className="booking-modal-divider">
          <span>HOẶC</span>
        </div>

        {/* Custom Booking Form */}
        <form onSubmit={handleSubmit} className="booking-form">
          <div className="booking-form-group">
            <label>
              <i className="fas fa-clock"></i>
              Thời gian bắt đầu
            </label>
            <input
              type="datetime-local"
              name="reservedStartTime"
              value={formData.reservedStartTime}
              onChange={handleChange}
              required
              min={getMinDateTime()}
              disabled={loading}
            />
          </div>

          <div className="booking-form-group">
            <label>
              <i className="fas fa-hourglass-half"></i>
              Thời lượng sạc (phút)
            </label>
            <select
              name="durationMinutes"
              value={formData.durationMinutes}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="30">30 phút</option>
              <option value="60">1 giờ</option>
              <option value="90">1.5 giờ</option>
              <option value="120">2 giờ</option>
              <option value="180">3 giờ</option>
            </select>
          </div>

          {/* Deposit Info Notice */}
          <div className="booking-deposit-notice">
            <i className="fas fa-info-circle"></i>
            <div>
              <strong>Thông tin tiền cọc:</strong>
              <p>Khi đặt chỗ, hệ thống sẽ thu tiền cọc <strong>50,000 ₫</strong> từ ví của bạn.</p>
              <p>Tiền cọc sẽ được hoàn lại khi bạn check-in đúng hạn (trong vòng 15 phút sau thời gian đặt).</p>
              <p className="warning-text">⚠️ Nếu không check-in đúng hạn, tiền cọc sẽ không được hoàn lại.</p>
            </div>
          </div>

          {chargerId && (
            <div className="booking-form-group">
              <label>
                <i className="fas fa-plug"></i>
                Cổng sạc ID
              </label>
              <input
                type="text"
                value={chargerId}
                disabled
                className="booking-input-disabled"
              />
              <small>Đã chọn cổng sạc #{chargerId}</small>
            </div>
          )}

          <div className="booking-form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  Xác nhận đặt chỗ
                </>
              )}
            </button>
          </div>
        </form>
      </div>

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

export default BookingModal;
