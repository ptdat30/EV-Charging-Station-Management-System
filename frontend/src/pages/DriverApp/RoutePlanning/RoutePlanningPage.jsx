// src/pages/DriverApp/RoutePlanning/RoutePlanningPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllStations } from '../../../services/stationService';
import { createRouteReservations } from '../../../services/routeService';
import { useAuth } from '../../../context/AuthContext';
import { sampleRoutes, getRoutesByType } from '../../../data/sampleRoutes';
import '../../../styles/RoutePlanningPage.css';

const RoutePlanningPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState([]);
  
  // Route type selection
  const [routeType, setRouteType] = useState('fastest'); // 'fastest', 'cheapest', 'comfort'
  
  // Selected route
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedStations, setSelectedStations] = useState([]);
  
  // Booking state
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  // Filter routes by type
  const availableRoutes = useMemo(() => {
    return getRoutesByType(routeType);
  }, [routeType]);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      const data = await getAllStations();
      setStations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading stations:', err);
    } finally {
      setLoading(false);
    }
  };

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

  // Select a route
  const handleSelectRoute = (route) => {
    setSelectedRoute(route);
    
    // Calculate actual arrival/departure times based on current time
    const now = new Date();
    
    // Backend requires: start time must be at least 30 minutes from now
    // Round up to next hour to be safe and cleaner
    const minStartTime = new Date(now);
    minStartTime.setHours(now.getHours() + 1, 0, 0, 0); // Next hour, rounded to :00
    
    // Ensure at least 1 hour from now
    if (minStartTime.getTime() - now.getTime() < 60 * 60 * 1000) {
      minStartTime.setHours(now.getHours() + 2, 0, 0, 0);
    }
    
    // Parse estimated arrival/departure times (e.g., "+1h", "+2h30m")
    const parseTime = (timeStr) => {
      let minutes = 0;
      const hourMatch = timeStr.match(/(\d+)h/);
      const minMatch = timeStr.match(/(\d+)m/);
      if (hourMatch) minutes += parseInt(hourMatch[1]) * 60;
      if (minMatch) minutes += parseInt(minMatch[1]);
      return minutes;
    };
    
    // Calculate relative time differences between stations
    const firstStationArrivalOffset = parseTime(route.stations[0].estimatedArrival);
    const stationsWithTimings = route.stations.map((station, index) => {
      const arrivalOffset = parseTime(station.estimatedArrival);
      const departureOffset = parseTime(station.estimatedDeparture);
      
      // Calculate relative time difference from first station
      const relativeArrivalOffset = arrivalOffset - firstStationArrivalOffset; // minutes
      const relativeDepartureOffset = departureOffset - firstStationArrivalOffset; // minutes
      
      // Start from minStartTime and add relative offsets
      const arrivalTime = new Date(minStartTime.getTime() + relativeArrivalOffset * 60000);
      const departureTime = new Date(minStartTime.getTime() + relativeDepartureOffset * 60000);
      
      return {
        ...station,
        arrivalTime,
        departureTime,
        chargingDuration: station.chargingDuration
      };
    });
    
    setSelectedStations(stationsWithTimings);
  };

  // Book all stations on route
  const handleBookRoute = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để đặt chỗ');
      navigate('/login');
      return;
    }

    if (!selectedRoute || selectedStations.length === 0) {
      alert('Vui lòng chọn lộ trình trước khi đặt chỗ');
      return;
    }

    if (!confirm(`Xác nhận đặt chỗ tại ${selectedStations.length} trạm sạc dọc lộ trình "${selectedRoute.name}"?`)) {
      return;
    }

    setBookingInProgress(true);
    setBookingResult(null);

    try {
      // Prepare booking data for all stations
      const bookings = selectedStations.map(station => {
        // Use formatLocalDateTime to avoid timezone issues
        return {
          stationId: station.stationId,
          chargerId: null, // Let backend find available charger
          reservedStartTime: formatLocalDateTime(station.arrivalTime),
          reservedEndTime: formatLocalDateTime(station.departureTime),
          durationMinutes: station.chargingDuration,
          order: station.order
        };
      });

      // Create all reservations
      const results = await createRouteReservations(bookings);
      
      setBookingResult({
        success: true,
        reservations: results,
        count: results.length
      });

      alert(`✅ Đã đặt chỗ thành công tại ${results.length} trạm sạc!\n\n` +
            `Bạn có thể xem chi tiết trong trang "Quản lý sạc".\n\n` +
            `⚠️ Lưu ý: Hủy đặt chỗ tại trạm trước sẽ tự động giải phóng các trạm phía sau.`);
      
      // Navigate to booking page
      setTimeout(() => {
        navigate('/stations/booking');
      }, 2000);

    } catch (error) {
      console.error('Error booking route:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Đặt chỗ thất bại';
      setBookingResult({
        success: false,
        error: errorMsg
      });
      alert(`❌ ${errorMsg}`);
    } finally {
      setBookingInProgress(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('vi-VN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="route-planning-page">
      <div className="route-header">
        <h2>
          <i className="fas fa-route"></i>
          Lập Lộ Trình Sạc Xe
        </h2>
        <p>Chọn lộ trình phù hợp và đặt chỗ tại các trạm sạc dọc đường</p>
      </div>

      {/* Route Type Selection */}
      <div className="route-inputs-card">
        <div className="route-type-selection">
          <label>Lựa chọn loại lộ trình:</label>
          <div className="route-type-options">
            <button
              className={`route-type-btn ${routeType === 'fastest' ? 'active' : ''}`}
              onClick={() => {
                setRouteType('fastest');
                setSelectedRoute(null);
                setSelectedStations([]);
              }}
            >
              <i className="fas fa-tachometer-alt"></i>
              <div>
                <strong>Nhanh nhất</strong>
                <span>Ưu tiên trạm sạc nhanh, ít dừng</span>
              </div>
            </button>
            <button
              className={`route-type-btn ${routeType === 'cheapest' ? 'active' : ''}`}
              onClick={() => {
                setRouteType('cheapest');
                setSelectedRoute(null);
                setSelectedStations([]);
              }}
            >
              <i className="fas fa-dollar-sign"></i>
              <div>
                <strong>Tiết kiệm nhất</strong>
                <span>Ưu tiên giá rẻ, có gói thuê bao</span>
              </div>
            </button>
            <button
              className={`route-type-btn ${routeType === 'comfort' ? 'active' : ''}`}
              onClick={() => {
                setRouteType('comfort');
                setSelectedRoute(null);
                setSelectedStations([]);
              }}
            >
              <i className="fas fa-shopping-cart"></i>
              <div>
                <strong>Thoải mái nhất</strong>
                <span>Trạm tại trung tâm mua sắm, có tiện ích</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Available Routes List */}
      {availableRoutes.length > 0 && (
        <div className="routes-list-section">
          <h3>
            <i className="fas fa-list"></i>
            Lộ trình khuyến nghị ({availableRoutes.length} lộ trình)
          </h3>
          <div className="routes-grid">
            {availableRoutes.map((route) => (
              <div
                key={route.id}
                className={`route-card ${selectedRoute?.id === route.id ? 'selected' : ''}`}
                onClick={() => handleSelectRoute(route)}
              >
                <div className="route-card-header">
                  <h4>{route.name}</h4>
                  <span className="route-badge">{route.type === 'fastest' ? 'Nhanh' : route.type === 'cheapest' ? 'Rẻ' : 'Thoải mái'}</span>
                </div>
                <p className="route-description">{route.description}</p>
                <div className="route-info">
                  <div className="route-info-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{route.startLocation} → {route.endLocation}</span>
                  </div>
                  <div className="route-info-item">
                    <i className="fas fa-route"></i>
                    <span>{route.totalDistance} km</span>
                  </div>
                  <div className="route-info-item">
                    <i className="fas fa-clock"></i>
                    <span>{Math.round(route.estimatedTime / 60)} giờ {route.estimatedTime % 60} phút</span>
                  </div>
                  <div className="route-info-item">
                    <i className="fas fa-charging-station"></i>
                    <span>{route.stations.length} điểm dừng</span>
                  </div>
                  <div className="route-info-item">
                    <i className="fas fa-money-bill-wave"></i>
                    <span>{formatCurrency(route.totalCost)}</span>
                  </div>
                </div>
                <button
                  className="btn-select-route"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectRoute(route);
                  }}
                >
                  <i className="fas fa-check"></i>
                  Chọn lộ trình này
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Route Details */}
      {selectedRoute && selectedStations.length > 0 && (
        <div className="route-plan-card">
          <div className="route-summary">
            <div className="summary-item">
              <i className="fas fa-route"></i>
              <div>
                <strong>{selectedRoute.totalDistance} km</strong>
                <span>Tổng quãng đường</span>
              </div>
            </div>
            <div className="summary-item">
              <i className="fas fa-clock"></i>
              <div>
                <strong>{Math.round(selectedRoute.estimatedTime / 60)} giờ</strong>
                <span>Thời gian dự kiến</span>
              </div>
            </div>
            <div className="summary-item">
              <i className="fas fa-money-bill-wave"></i>
              <div>
                <strong>{formatCurrency(selectedRoute.totalCost)}</strong>
                <span>Tổng chi phí ước tính</span>
              </div>
            </div>
            <div className="summary-item">
              <i className="fas fa-charging-station"></i>
              <div>
                <strong>{selectedStations.length} trạm</strong>
                <span>Số điểm dừng</span>
              </div>
            </div>
          </div>

          {/* Station List */}
          <div className="route-stations-list">
            <h3>
              <i className="fas fa-list-ol"></i>
              Danh sách trạm sạc trên lộ trình
            </h3>
            {selectedStations.map((station, index) => (
              <div key={station.stationId} className="route-station-item">
                <div className="station-order">{station.order}</div>
                <div className="station-info">
                  <h4>{station.stationName}</h4>
                  <p>
                    <i className="fas fa-map-marker-alt"></i>
                    {station.address}
                  </p>
                  {station.amenities && station.amenities.length > 0 && (
                    <div className="station-amenities">
                      <i className="fas fa-star"></i>
                      {station.amenities.join(' • ')}
                    </div>
                  )}
                  <div className="station-timings">
                    <span>
                      <i className="fas fa-arrow-circle-right"></i>
                      Đến: {formatTime(station.arrivalTime)}
                    </span>
                    <span>
                      <i className="fas fa-clock"></i>
                      Sạc: {station.chargingDuration} phút
                    </span>
                    <span>
                      <i className="fas fa-arrow-circle-right"></i>
                      Đi: {formatTime(station.departureTime)}
                    </span>
                  </div>
                </div>
                <div className="station-status">
                  <span className="badge-available">Sẵn sàng</span>
                </div>
              </div>
            ))}
          </div>

          {/* Book Route Button */}
          <div className="route-actions">
            <button
              className="btn-book-route"
              onClick={handleBookRoute}
              disabled={bookingInProgress}
            >
              {bookingInProgress ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Đang đặt chỗ...
                </>
              ) : (
                <>
                  <i className="fas fa-calendar-check"></i>
                  Đặt chỗ tự động tại tất cả trạm
                </>
              )}
            </button>
            <p className="booking-note">
              <i className="fas fa-info-circle"></i>
              Hủy đặt chỗ tại trạm trước sẽ tự động giải phóng các trạm phía sau
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Đang tìm lộ trình...</p>
        </div>
      )}
    </div>
  );
};

export default RoutePlanningPage;
