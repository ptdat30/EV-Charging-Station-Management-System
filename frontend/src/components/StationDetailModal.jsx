// src/components/StationDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { getStationById, getStationChargers } from '../services/stationService';
import BookingModal from './BookingModal';
import AlertModal from './AlertModal';
import '../styles/StationDetailModal.css';

const StationDetailModal = ({ isOpen, onClose, stationId, station: initialStation }) => {
  const [station, setStation] = useState(initialStation || null);
  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedCharger, setSelectedCharger] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (initialStation) {
        // If station is passed as prop, use it and just load chargers
        setStation(initialStation);
        loadChargers(initialStation.stationId || initialStation.id);
        setLoading(false);
      } else if (stationId) {
        // Otherwise load station by ID
        loadStationData();
      }
    } else {
      // Reset state when modal closes
      setStation(null);
      setChargers([]);
      setError(null);
      setRating(0);
      setHoverRating(0);
      setIsBookingOpen(false);
      setSelectedCharger(null);
    }
  }, [isOpen, stationId, initialStation]);

  const loadStationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [stationData, chargersData] = await Promise.all([
        getStationById(stationId),
        getStationChargers(stationId)
      ]);
      
      setStation(stationData);
      setChargers(Array.isArray(chargersData) ? chargersData : []);
    } catch (err) {
      console.error('Error loading station data:', err);
      setError(err.response?.data?.message || err.message || 'Không thể tải thông tin trạm sạc');
    } finally {
      setLoading(false);
    }
  };

  const loadChargers = async (id) => {
    try {
      const chargersData = await getStationChargers(id);
      setChargers(Array.isArray(chargersData) ? chargersData : []);
    } catch (err) {
      console.error('Error loading chargers:', err);
      setChargers([]);
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleBook = (charger = null) => {
    if (!station || station.status !== 'online') {
      setAlertModal({
        isOpen: true,
        title: 'Không thể đặt chỗ',
        message: 'Trạm sạc hiện không khả dụng. Vui lòng chọn trạm khác.',
        type: 'warning'
      });
      return;
    }
    setSelectedCharger(charger);
    setIsBookingOpen(true);
  };

  const handleDirections = () => {
    if (!station) return;
    
    let locationData = {};
    try {
      locationData = typeof station.location === 'string' 
        ? JSON.parse(station.location || '{}') 
        : (station.location || {});
    } catch (e) {
      console.error('Error parsing location:', e);
    }

    const lat = locationData.latitude;
    const lng = locationData.longitude;
    
    if (lat && lng) {
      // Open Google Maps with directions
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, '_blank');
    } else {
      setAlertModal({
        isOpen: true,
        title: 'Không có địa chỉ',
        message: 'Trạm sạc này chưa có thông tin địa chỉ để chỉ đường.',
        type: 'info'
      });
    }
  };

  const handleRate = async () => {
    if (rating === 0) {
      setAlertModal({
        isOpen: true,
        title: 'Chưa chọn đánh giá',
        message: 'Vui lòng chọn số sao để đánh giá trạm sạc này.',
        type: 'info'
      });
      return;
    }

    // TODO: Implement rating API call
    setAlertModal({
      isOpen: true,
      title: 'Cảm ơn bạn!',
      message: `Bạn đã đánh giá ${rating} sao cho trạm sạc này.`,
      type: 'success'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'available': { text: 'Trống', class: 'status-available', icon: 'fa-check-circle' },
      'in_use': { text: 'Đang sử dụng', class: 'status-in-use', icon: 'fa-bolt' },
      'maintenance': { text: 'Bảo trì', class: 'status-maintenance', icon: 'fa-wrench' },
      'offline': { text: 'Offline', class: 'status-offline', icon: 'fa-times-circle' }
    };
    
    const statusInfo = statusMap[status] || statusMap['offline'];
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        <i className={`fas ${statusInfo.icon}`}></i>
        {statusInfo.text}
      </span>
    );
  };

  const getChargerTypeLabel = (type) => {
    const typeMap = {
      'CCS': 'CCS (DC Fast)',
      'AC_Type2': 'AC Type 2',
      'CHAdeMO': 'CHAdeMO',
      'AC_Type1': 'AC Type 1'
    };
    return typeMap[type] || type || 'Unknown';
  };

  const getChargerPower = (charger) => {
    // Default power based on type
    const powerMap = {
      'CCS': '50 kW',
      'AC_Type2': '22 kW',
      'CHAdeMO': '50 kW',
      'AC_Type1': '7.4 kW'
    };
    return charger.power || powerMap[charger.chargerType] || 'N/A';
  };

  // Generate hourly price chart data
  const generatePriceChart = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const basePrice = 4500; // Base price in VND per kWh
    
    return hours.map(hour => {
      // Simulate price variation: higher during peak hours (8-10, 17-19)
      let multiplier = 1.0;
      if ((hour >= 8 && hour < 10) || (hour >= 17 && hour < 19)) {
        multiplier = 1.2; // 20% higher during peak
      } else if (hour >= 22 || hour < 6) {
        multiplier = 0.9; // 10% lower during off-peak
      }
      
      return {
        hour,
        price: Math.round(basePrice * multiplier),
        label: `${hour}:00`
      };
    });
  };

  const priceChartData = generatePriceChart();
  const maxPrice = Math.max(...priceChartData.map(d => d.price));

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="station-detail-modal-overlay" onClick={handleClose}>
        <div className="station-detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="station-detail-loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Đang tải thông tin trạm sạc...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="station-detail-modal-overlay" onClick={handleClose}>
        <div className="station-detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="station-detail-error">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error || 'Không tìm thấy trạm sạc'}</p>
            <button onClick={handleClose} className="btn-back">
              <i className="fas fa-times"></i> Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Parse location data
  let locationData = {};
  try {
    locationData = typeof station.location === 'string' 
      ? JSON.parse(station.location || '{}') 
      : (station.location || {});
  } catch (e) {
    console.error('Error parsing location:', e);
  }

  const address = locationData.address || 'Địa chỉ không xác định';
  const fullAddress = [
    address,
    locationData.district,
    locationData.city
  ].filter(Boolean).join(', ');

  // Operating hours (default to 24/7 if not specified)
  const operatingHours = station.operatingHours || '24/7 (Mở cửa cả ngày)';

  const availableChargers = chargers.filter(c => c.status === 'available').length;
  const stationRating = parseFloat(station.rating) || 0;

  return (
    <>
      <div className="station-detail-modal-overlay" onClick={handleClose}>
        <div className="station-detail-modal" onClick={(e) => e.stopPropagation()}>
          {/* Close Button */}
          <button className="btn-close-modal" onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>

          {/* Content */}
          <div className="station-detail-content">
            {/* Station Info Section */}
            <section className="detail-section">
              <div className="section-header-with-title">
                <h1 className="station-title">{station.stationName || station.name}</h1>
                <div className="station-code">
                  <i className="fas fa-hashtag"></i>
                  {station.stationCode || `#${station.stationId || station.id}`}
                </div>
                <span className={`status-main ${station.status}`}>
                  {station.status === 'online' ? (
                    <>
                      <i className="fas fa-check-circle"></i>
                      Đang hoạt động
                    </>
                  ) : station.status === 'offline' ? (
                    <>
                      <i className="fas fa-times-circle"></i>
                      Tạm ngưng
                    </>
                  ) : station.status === 'maintenance' ? (
                    <>
                      <i className="fas fa-wrench"></i>
                      Bảo trì
                    </>
                  ) : station.status === 'closed' ? (
                    <>
                      <i className="fas fa-lock"></i>
                      Đóng cửa
                    </>
                  ) : (
                    station.status
                  )}
                </span>
              </div>
              <h2>
                <i className="fas fa-info-circle"></i>
                Thông tin trạm
              </h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>
                    <i className="fas fa-map-marker-alt"></i>
                    Địa chỉ:
                  </label>
                  <p>{fullAddress}</p>
                </div>
                <div className="info-item">
                  <label>
                    <i className="fas fa-clock"></i>
                    Giờ hoạt động:
                  </label>
                  <p>{operatingHours}</p>
                </div>
                <div className="info-item">
                  <label>
                    <i className="fas fa-star"></i>
                    Đánh giá:
                  </label>
                  <p>
                    <span className="rating-display">
                      {stationRating.toFixed(1)}
                      <i className="fas fa-star"></i>
                    </span>
                    {station.reviews && (
                      <span className="reviews-count">({station.reviews} đánh giá)</span>
                    )}
                  </p>
                </div>
                <div className="info-item">
                  <label>
                    <i className="fas fa-bolt"></i>
                    Cổng sạc:
                  </label>
                  <p>
                    <strong style={{ color: availableChargers > 0 ? '#10b981' : '#ef4444' }}>
                      {availableChargers}/{chargers.length} trống
                    </strong>
                  </p>
                </div>
              </div>
            </section>

            {/* Charging Points Section */}
            <section className="detail-section">
              <h2>
                <i className="fas fa-plug"></i>
                Danh sách điểm sạc ({chargers.length})
              </h2>
              {chargers.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>Chưa có điểm sạc nào</p>
                </div>
              ) : (
                <div className="chargers-grid">
                  {chargers.map((charger) => (
                    <div key={charger.chargerId || charger.id} className="charger-card">
                      <div className="charger-header">
                        <h3>{charger.chargerCode || `Điểm sạc #${charger.chargerId || charger.id}`}</h3>
                        {getStatusBadge(charger.status)}
                      </div>
                      <div className="charger-details">
                        <div className="charger-detail-item">
                          <i className="fas fa-plug"></i>
                          <span><strong>Loại cổng:</strong> {getChargerTypeLabel(charger.chargerType)}</span>
                        </div>
                        <div className="charger-detail-item">
                          <i className="fas fa-bolt"></i>
                          <span><strong>Công suất:</strong> {getChargerPower(charger)}</span>
                        </div>
                      </div>
                      {charger.status === 'available' && (
                        <button 
                          className="btn-book-charger"
                          onClick={() => handleBook(charger)}
                        >
                          <i className="fas fa-calendar-check"></i>
                          Đặt chỗ
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Price Chart Section */}
            <section className="detail-section">
              <h2>
                <i className="fas fa-chart-line"></i>
                Biểu đồ giá theo giờ
              </h2>
              <div className="price-chart-container">
                <div className="price-chart">
                  {priceChartData.map((data, index) => {
                    const height = (data.price / maxPrice) * 100;
                    const isPeak = (data.hour >= 8 && data.hour < 10) || (data.hour >= 17 && data.hour < 19);
                    const isOffPeak = data.hour >= 22 || data.hour < 6;
                    
                    return (
                      <div key={index} className="price-bar-container">
                        <div 
                          className={`price-bar ${isPeak ? 'peak' : isOffPeak ? 'off-peak' : 'normal'}`}
                          style={{ height: `${height}%` }}
                          title={`${data.label}: ${data.price.toLocaleString('vi-VN')} VNĐ/kWh`}
                        >
                          <span className="price-value">{data.price.toLocaleString('vi-VN')}</span>
                        </div>
                        <span className="price-hour">{data.hour}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="price-legend">
                  <div className="legend-item">
                    <span className="legend-color peak"></span>
                    <span>Giờ cao điểm (8-10h, 17-19h)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color normal"></span>
                    <span>Giờ bình thường</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color off-peak"></span>
                    <span>Giờ thấp điểm (22h-6h)</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Rating Section */}
            <section className="detail-section">
              <h2>
                <i className="fas fa-star"></i>
                Đánh giá trạm sạc
              </h2>
              <div className="rating-section">
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <i className="fas fa-star"></i>
                    </button>
                  ))}
                </div>
                <button className="btn-submit-rating" onClick={handleRate}>
                  <i className="fas fa-paper-plane"></i>
                  Gửi đánh giá
                </button>
              </div>
            </section>
          </div>

          {/* Actions Footer */}
          <div className="station-detail-actions">
            <button className="btn-action btn-directions" onClick={handleDirections}>
              <i className="fas fa-directions"></i>
              Chỉ đường
            </button>
            <button 
              className="btn-action btn-book-main" 
              onClick={() => handleBook()}
              disabled={station.status !== 'online' || availableChargers === 0}
            >
              <i className="fas fa-calendar-check"></i>
              Đặt chỗ
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {station && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedCharger(null);
          }}
          station={{
            ...station,
            id: station.stationId || station.id,
            stationId: station.stationId || station.id,
            name: station.stationName || station.name,
            chargers: chargers
          }}
          chargerId={selectedCharger?.chargerId || selectedCharger?.id}
          onSuccess={() => {
            setIsBookingOpen(false);
            setSelectedCharger(null);
            setAlertModal({
              isOpen: true,
              title: 'Đặt chỗ thành công!',
              message: 'Bạn đã đặt chỗ thành công. Vui lòng đến đúng giờ.',
              type: 'success'
            });
          }}
        />
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </>
  );
};

export default StationDetailModal;

