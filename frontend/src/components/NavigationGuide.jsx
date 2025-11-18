// src/components/NavigationGuide.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { getStationById, getStationChargers, getChargerById } from '../services/stationService';
import '../styles/NavigationGuide.css';

// Fix for default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to update map view
function MapUpdater({ center, zoom, route }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  // Fit bounds when route changes
  useEffect(() => {
    if (route && route.length >= 2) {
      const bounds = L.latLngBounds(route);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route, map]);
  
  return null;
}

const NavigationGuide = ({ reservation, finalDestination = null, onClose = null }) => {
  const [station, setStation] = useState(null);
  const [charger, setCharger] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [directions, setDirections] = useState([]);
  const [timePredictions, setTimePredictions] = useState({
    arrivalTime: null,
    chargingTime: null,
    finalDestinationTime: null,
    distance: null,
    estimatedDuration: null
  });

  // Load station and charger data
  useEffect(() => {
    const loadData = async () => {
      if (!reservation?.stationId) return;
      
      try {
        setLoading(true);
        setError(null);

        // Load station
        const stationData = await getStationById(reservation.stationId);
        setStation(stationData);

        // Load charger if available
        if (reservation.chargerId) {
          try {
            const chargerData = await getChargerById(reservation.chargerId);
            setCharger(chargerData);
          } catch (err) {
            console.warn('Could not load charger details:', err);
          }
        } else {
          // Load all chargers and find available one
          const chargers = await getStationChargers(reservation.stationId);
          const availableCharger = chargers.find(c => c.status === 'available') || chargers[0];
          if (availableCharger) {
            setCharger(availableCharger);
          }
        }
      } catch (err) {
        console.error('Error loading station data:', err);
        setError(err.response?.data?.message || err.message || 'Không thể tải thông tin trạm sạc');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [reservation]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          console.warn('Could not get user location:', err);
          // Default to Ho Chi Minh City center
          setUserLocation({ lat: 10.762622, lng: 106.660172 });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setUserLocation({ lat: 10.762622, lng: 106.660172 });
    }
  }, []);

  // Calculate route and directions
  useEffect(() => {
    if (!userLocation || !station?.location) return;

    const calculateRoute = async () => {
      try {
        // Parse station location
        let locationData = {};
        if (station.location) {
          locationData = typeof station.location === 'string' 
            ? JSON.parse(station.location) 
            : station.location;
        }

        if (!locationData.latitude || !locationData.longitude) {
          setError('Trạm sạc không có tọa độ hợp lệ');
          return;
        }

        const stationLat = locationData.latitude;
        const stationLng = locationData.longitude;

        // Calculate distance using Haversine formula
        const distance = calculateDistance(
          userLocation.lat, userLocation.lng,
          stationLat, stationLng
        );

        // Estimate travel time (assuming average speed of 40 km/h in city)
        const avgSpeed = 40; // km/h
        const estimatedMinutes = Math.round((distance / avgSpeed) * 60);
        const estimatedDuration = estimatedMinutes;

        // Calculate arrival time
        const now = new Date();
        const arrivalTime = new Date(now.getTime() + estimatedMinutes * 60000);

        // Calculate charging time
        const chargingTime = reservation.durationMinutes || 60; // Default 60 minutes

        // Calculate final destination time (if provided)
        let finalDestinationTime = null;
        if (finalDestination && finalDestination.lat && finalDestination.lng) {
          const finalDistance = calculateDistance(
            stationLat, stationLng,
            finalDestination.lat, finalDestination.lng
          );
          const finalMinutes = Math.round((finalDistance / avgSpeed) * 60);
          finalDestinationTime = new Date(
            arrivalTime.getTime() + (chargingTime + finalMinutes) * 60000
          );
        }

        setTimePredictions({
          arrivalTime,
          chargingTime,
          finalDestinationTime,
          distance,
          estimatedDuration
        });

        // Generate step-by-step directions (simplified)
        const steps = generateDirections(userLocation, { lat: stationLat, lng: stationLng }, distance);
        setDirections(steps);

        // Create route polyline
        const routeCoords = [
          [userLocation.lat, userLocation.lng],
          [stationLat, stationLng]
        ];
        setRoute(routeCoords);

      } catch (err) {
        console.error('Error calculating route:', err);
        setError('Không thể tính toán tuyến đường');
      }
    };

    calculateRoute();
  }, [userLocation, station, reservation, finalDestination]);


  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Generate simplified step-by-step directions
  const generateDirections = (start, end, distance) => {
    const steps = [];
    
    // Step 1: Start
    steps.push({
      instruction: 'Bắt đầu từ vị trí hiện tại của bạn',
      distance: 0,
      icon: 'fa-map-marker-alt'
    });

    // Step 2: Navigate to station
    if (distance > 1) {
      steps.push({
        instruction: `Đi theo hướng đến trạm sạc (khoảng ${distance.toFixed(1)} km)`,
        distance: distance,
        icon: 'fa-route'
      });
    }

    // Step 3: Arrive at station
    steps.push({
      instruction: 'Đến trạm sạc',
      distance: 0,
      icon: 'fa-flag-checkered'
    });

    // Step 4: Find charger (if charger info available)
    if (charger) {
      steps.push({
        instruction: `Tìm cổng sạc ${charger.chargerCode || charger.chargerId} (${charger.chargerType || 'N/A'})`,
        distance: 0,
        icon: 'fa-plug'
      });
    }

    // Step 5: Parking instructions (if available)
    if (station?.location?.parkingInstructions) {
      steps.push({
        instruction: station.location.parkingInstructions,
        distance: 0,
        icon: 'fa-car'
      });
    }

    return steps;
  };

  // Format time
  const formatTime = (date) => {
    if (!date) return '--';
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return '--';
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} giờ ${mins} phút` : `${hours} giờ`;
  };

  // Get station location
  const getStationLocation = () => {
    if (!station?.location) return null;
    const locationData = typeof station.location === 'string' 
      ? JSON.parse(station.location) 
      : station.location;
    return {
      lat: locationData.latitude,
      lng: locationData.longitude
    };
  };

  const stationLocation = getStationLocation();
  const mapCenter = stationLocation || userLocation || [10.762622, 106.660172];

  if (loading) {
    return (
      <div className="navigation-guide">
        <div className="navigation-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải thông tin dẫn đường...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="navigation-guide">
        <div className="navigation-error">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="navigation-guide">
      <div className="navigation-header">
        <h3>
          <i className="fas fa-route"></i>
          Dẫn đường đến trạm sạc
        </h3>
        {onClose && (
          <button
            className="btn-close-navigation"
            onClick={onClose}
            title="Đóng dẫn đường"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      {/* Time Predictions */}
      <div className="time-predictions">
        <div className="prediction-card">
          <div className="prediction-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="prediction-content">
            <div className="prediction-label">Thời gian đến nơi</div>
            <div className="prediction-value">
              {timePredictions.arrivalTime ? formatTime(timePredictions.arrivalTime) : '--'}
            </div>
            {timePredictions.estimatedDuration && (
              <div className="prediction-subtitle">
                Khoảng {formatDuration(timePredictions.estimatedDuration)}
              </div>
            )}
          </div>
        </div>

        <div className="prediction-card">
          <div className="prediction-icon">
            <i className="fas fa-bolt"></i>
          </div>
          <div className="prediction-content">
            <div className="prediction-label">Thời gian sạc</div>
            <div className="prediction-value">
              {formatDuration(timePredictions.chargingTime)}
            </div>
            {reservation.reservedStartTime && (
              <div className="prediction-subtitle">
                Từ {formatTime(new Date(reservation.reservedStartTime))}
              </div>
            )}
          </div>
        </div>

        {timePredictions.finalDestinationTime && (
          <div className="prediction-card">
            <div className="prediction-icon">
              <i className="fas fa-flag-checkered"></i>
            </div>
            <div className="prediction-content">
              <div className="prediction-label">Đến đích cuối</div>
              <div className="prediction-value">
                {formatTime(timePredictions.finalDestinationTime)}
              </div>
              <div className="prediction-subtitle">
                Sau khi sạc xong
              </div>
            </div>
          </div>
        )}

        {timePredictions.distance && (
          <div className="prediction-card">
            <div className="prediction-icon">
              <i className="fas fa-route"></i>
            </div>
            <div className="prediction-content">
              <div className="prediction-label">Khoảng cách</div>
              <div className="prediction-value">
                {timePredictions.distance.toFixed(1)} km
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="navigation-map-container">
        <MapContainer
          center={mapCenter}
          zoom={15}
          style={{ height: '400px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={mapCenter} zoom={15} route={route} />
          
          {/* Route polyline */}
          {route && route.length >= 2 && (
            <Polyline
              positions={route}
              pathOptions={{
                color: '#4CAF50',
                weight: 5,
                opacity: 0.7,
                dashArray: '10, 10'
              }}
            />
          )}
          
          {/* User location marker */}
          {userLocation && (
            <Marker 
              position={[userLocation.lat, userLocation.lng]}
              icon={L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              })}
            >
              <Popup>
                <strong>Vị trí của bạn</strong>
              </Popup>
            </Marker>
          )}

          {/* Station marker */}
          {stationLocation && (
            <Marker 
              position={[stationLocation.lat, stationLocation.lng]}
              icon={L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              })}
            >
              <Popup>
                <div className="station-popup">
                  <strong>{station?.stationName || 'Trạm sạc'}</strong>
                  <br />
                  <small>
                    <i className="fas fa-map-marker-alt"></i> {station?.location?.address || 'Địa chỉ không xác định'}
                  </small>
                  {charger && (
                    <>
                      <br />
                      <small>
                        <i className="fas fa-plug"></i> Cổng: {charger.chargerCode || charger.chargerId}
                      </small>
                      <br />
                      <small>
                        <i className="fas fa-bolt"></i> Loại: {charger.chargerType || 'N/A'}
                      </small>
                      {charger.power && (
                        <>
                          <br />
                          <small>
                            <i className="fas fa-tachometer-alt"></i> Công suất: {charger.power} kW
                          </small>
                        </>
                      )}
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Station Info */}
      {station && (
        <div className="station-info-card">
          <h4>
            <i className="fas fa-info-circle"></i>
            Thông tin trạm sạc
          </h4>
          <div className="station-info-grid">
            <div className="info-item">
              <span className="info-label">Tên trạm:</span>
              <span className="info-value">{station.stationName || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Địa chỉ:</span>
              <span className="info-value">
                {station.location?.address || station.location?.location || 'N/A'}
              </span>
            </div>
            {charger && (
              <>
                <div className="info-item">
                  <span className="info-label">Cổng sạc:</span>
                  <span className="info-value">{charger.chargerCode || charger.chargerId}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Loại đầu cắm:</span>
                  <span className="info-value">{charger.chargerType || 'N/A'}</span>
                </div>
                {charger.power && (
                  <div className="info-item">
                    <span className="info-label">Công suất:</span>
                    <span className="info-value">{charger.power} kW</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Step-by-step Directions */}
      {directions.length > 0 && (
        <div className="directions-card">
          <h4>
            <i className="fas fa-list-ol"></i>
            Hướng dẫn từng bước
          </h4>
          <div className="directions-list">
            {directions.map((step, index) => (
              <div key={index} className="direction-step">
                <div className="step-number">{index + 1}</div>
                <div className="step-content">
                  <div className="step-instruction">
                    <i className={`fas ${step.icon}`}></i>
                    {step.instruction}
                  </div>
                  {step.distance > 0 && (
                    <div className="step-distance">
                      {step.distance.toFixed(1)} km
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="navigation-actions">
        {stationLocation && userLocation && (
          <a
            href={`https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${stationLocation.lat},${stationLocation.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-navigate"
          >
            <i className="fas fa-directions"></i>
            Mở Google Maps
          </a>
        )}
      </div>
    </div>
  );
};

export default NavigationGuide;

