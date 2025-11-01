// src/components/StationCard.jsx
import React, { useState, useMemo, useCallback } from 'react';
import BookingModal from './BookingModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../config/api';

const StationCard = React.memo(({ station }) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [startingCharge, setStartingCharge] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleQuickBook = useCallback(() => {
    setIsBookingOpen(true);
  }, []);

  const handleBookClick = useCallback(() => {
    setIsBookingOpen(true);
  }, []);

  const handleBookingSuccess = useCallback((reservation) => {
    console.log('Booking successful:', reservation);
  }, []);

  const handleQuickCharge = useCallback(async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để sạc');
      navigate('/login');
      return;
    }

    // Kiểm tra trạm có available charger không
    const availableCharger = station.chargers?.find(c => c.status === 'available');
    if (!availableCharger) {
      alert('❌ Không có cổng sạc trống tại trạm này. Vui lòng đặt chỗ hoặc chọn trạm khác.');
      return;
    }

    if (!confirm(`Xác nhận bắt đầu sạc ngay tại trạm ${station.name || station.stationName}?\nCổng sạc: ${availableCharger.chargerCode || availableCharger.chargerId}`)) {
      return;
    }

    setStartingCharge(true);
    try {
      const response = await apiClient.post('/sessions/start', {
        userId: user.userId || user.id,
        stationId: station.id || station.stationId,
        chargerId: availableCharger.chargerId
      });

      if (response.data) {
        alert(`✅ Đã bắt đầu phiên sạc!\n\nMã phiên: ${response.data.sessionCode || response.data.sessionId}`);
        // Navigate to charging live page
        navigate('/sessions/live');
      }
    } catch (error) {
      console.error('Error starting charge:', error);
      alert(`❌ ${error.response?.data?.message || error.message || 'Không thể bắt đầu phiên sạc'}`);
    } finally {
      setStartingCharge(false);
    }
  }, [user, station, navigate]);

  // Memoize parsed location data
  const locationData = useMemo(() => {
    return typeof station.locationData === 'string' 
      ? JSON.parse(station.locationData || '{}') 
      : (station.locationData || {});
  }, [station.locationData]);
  
  // Memoize station info
  const stationInfo = useMemo(() => {
    const address = station.address || locationData.address || 'Địa chỉ không xác định';
    const distance = station.distance || 'Khoảng cách không xác định';
    const rating = station.rating || 0;
    const reviews = station.reviews || 0;
    const types = station.types || ['CCS', 'AC Type2'];
    const price = station.price || '4.500 VNĐ/kWh';
    const chargerCount = station.chargers?.length || 0;
    const availableChargers = station.chargers?.filter(c => c.status === 'available').length || 0;
    
    return { address, distance, rating, reviews, types, price, chargerCount, availableChargers };
  }, [station, locationData]);

  return (
    <>
      <div className="station-card">
        <div className="station-img-placeholder">
          <i className="fas fa-charging-station"></i>
        </div>
        <div className="station-info">
          <h3>{station.name || station.stationName}</h3>
          <p className="distance">
            <i className="fas fa-map-marker-alt"></i>
            {stationInfo.distance && <span className="distance-value">{stationInfo.distance}</span>}
            <br />
            <span className="address">{stationInfo.address}</span>
            {station.district && <span className="district">{station.district}</span>}
          </p>
          <div className="rating">
            <i className="fas fa-star"></i>
            <strong>{stationInfo.rating.toFixed(1)}</strong> 
            {stationInfo.reviews > 0 && <span className="reviews">({stationInfo.reviews} đánh giá)</span>}
          </div>
          <div className="tags">
            {stationInfo.types.map((type, i) => (
              <span key={i} className="tag">
                <i className="fas fa-plug"></i>
                {type}
              </span>
            ))}
          </div>
          <div className="charger-info">
            <i className="fas fa-bolt"></i>
            <span>
              {stationInfo.availableChargers > 0 ? (
                <strong style={{ color: 'green' }}>{stationInfo.availableChargers}/{stationInfo.chargerCount} trống</strong>
              ) : (
                <span>{stationInfo.chargerCount} cổng sạc</span>
              )}
            </span>
          </div>
          <div className="price">
            <i className="fas fa-money-bill-wave"></i>
            {stationInfo.price}
          </div>
          {station.status && (
            <div className="status-badge">
              <span className={`status ${station.status}`}>
                {station.status === 'online' ? '✓ Đang hoạt động' : 
                 station.status === 'offline' ? '✗ Tạm ngưng' :
                 station.status === 'maintenance' ? '🔧 Bảo trì' : station.status}
              </span>
            </div>
          )}
        </div>
        <div className="station-actions">
          {station.status === 'online' ? (
            <>
              <button 
                className="btn-quick-charge"
                onClick={handleQuickCharge}
                disabled={startingCharge || !station.chargers?.some(c => c.status === 'available')}
                title="Sạc ngay (không cần đặt chỗ)"
              >
                {startingCharge ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang khởi động...
                  </>
                ) : (
                  <>
                    <i className="fas fa-bolt"></i>
                    <span>Sạc ngay</span>
                  </>
                )}
              </button>
              <button 
                className="btn-quick-book-card"
                onClick={handleQuickBook}
                title="Đặt chỗ nhanh"
              >
                <i className="fas fa-bolt"></i>
                Đặt nhanh
              </button>
              <button 
                className="btn-book"
                onClick={handleBookClick}
              >
                <i className="fas fa-calendar-check"></i>
                Đặt chỗ
              </button>
            </>
          ) : (
            <div className="booking-notice" style={{ 
              gridColumn: '1 / -1',
              padding: '0.75rem',
              background: '#fee2e2',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#991b1b'
            }}>
              <i className="fas fa-exclamation-triangle"></i>
              <span>
                {station.status === 'maintenance' ? 'Trạm đang bảo trì - Không thể đặt chỗ hoặc sạc' :
                 station.status === 'offline' ? 'Trạm tạm ngưng - Không thể đặt chỗ hoặc sạc' :
                 station.status === 'closed' ? 'Trạm đã đóng cửa - Không thể đặt chỗ hoặc sạc' :
                 'Trạm không khả dụng - Không thể đặt chỗ hoặc sạc'}
              </span>
            </div>
          )}
          <button 
            className="btn-detail"
            onClick={() => navigate(`/stations/${station.id}`)}
          >
            <i className="fas fa-info-circle"></i>
            Chi tiết
          </button>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        station={station}
        onSuccess={handleBookingSuccess}
      />
    </>
  );
});

StationCard.displayName = 'StationCard';

export default StationCard;