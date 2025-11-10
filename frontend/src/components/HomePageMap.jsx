import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getAllStations, getStationChargers } from '../services/stationService';
import 'leaflet/dist/leaflet.css';
import '../styles/HomePageMap.css';

// Fix for default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const HomePageMap = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([10.762622, 106.660172]); // Default to Ho Chi Minh City
  const [mapZoom, setMapZoom] = useState(12);

  // Fetch stations from API
  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoading(true);
        const data = await getAllStations();
        
        // Transform backend data to frontend format
        const transformedStations = await Promise.all(
          data.map(async (station) => {
            try {
              // Parse location JSON
              let locationData = {};
              if (station.location) {
                locationData = typeof station.location === 'string' 
                  ? JSON.parse(station.location) 
                  : station.location;
              }

              // Get chargers for this station
              let chargers = [];
              try {
                chargers = await getStationChargers(station.stationId);
              } catch (err) {
                console.warn(`Failed to load chargers for station ${station.stationId}:`, err);
              }

              return {
                id: station.stationId,
                stationId: station.stationId,
                name: station.stationName,
                code: station.stationCode,
                address: locationData.address || locationData.location || 'Địa chỉ không xác định',
                district: locationData.district || '',
                city: locationData.city || 'TP.HCM',
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                status: station.status || 'online',
                chargers: chargers,
                availableChargers: chargers.filter(c => c.status === 'available').length,
                totalChargers: chargers.length
              };
            } catch (err) {
              console.error(`Error processing station ${station.stationId}:`, err);
              return null;
            }
          })
        );

        // Filter out null stations and stations without coordinates
        const validStations = transformedStations.filter(s => 
          s !== null && s.latitude && s.longitude
        );
        
        setStations(validStations);
        
        // Update map center to first station or default
        if (validStations.length > 0) {
          // Calculate center of all stations
          const avgLat = validStations.reduce((sum, s) => sum + s.latitude, 0) / validStations.length;
          const avgLng = validStations.reduce((sum, s) => sum + s.longitude, 0) / validStations.length;
          setMapCenter([avgLat, avgLng]);
          setMapZoom(11);
        }
      } catch (err) {
        console.error('Failed to load stations:', err);
        setError(err.response?.data?.message || err.message || 'Không thể tải danh sách trạm sạc');
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, []);

  // Custom green marker icon for charging stations
  const stationIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <section className="homepage-map-section">
      {/* Subtle Particles */}
      <div className="particles-container">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 6}s`
            }}
          />
        ))}
      </div>

      <div className="homepage-map-container">
        <h2 className="homepage-map-title">
          <i className="fas fa-map-marked-alt"></i>
          Bản Đồ Trạm Sạc
        </h2>
        <p className="homepage-map-subtitle">
          Khám phá mạng lưới trạm sạc trên toàn quốc
        </p>

        {loading ? (
          <div className="map-loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Đang tải bản đồ và trạm sạc...</p>
          </div>
        ) : error ? (
          <div className="map-error">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Thử lại</button>
          </div>
        ) : (
          <div className="homepage-map-wrapper">
            <div className="homepage-map-inner">
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
                className="homepage-map"
              >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Station markers */}
              {stations.map(station => (
                <Marker
                  key={station.id}
                  position={[station.latitude, station.longitude]}
                  icon={stationIcon}
                >
                  <Popup>
                    <div className="station-popup">
                      <strong>{station.name}</strong>
                      <br />
                      <small>
                        <i className="fas fa-map-marker-alt"></i> {station.address}
                      </small>
                      <br />
                      <small>
                        <i className="fas fa-plug"></i> {station.availableChargers}/{station.totalChargers} cổng sạc
                      </small>
                      <br />
                      <small>
                        <i className="fas fa-circle" style={{ 
                          color: station.status === 'online' ? '#4CAF50' : '#f44336',
                          fontSize: '8px'
                        }}></i> {station.status === 'online' ? 'Đang hoạt động' : 'Bảo trì'}
                      </small>
                    </div>
                  </Popup>
                </Marker>
              ))}
              </MapContainer>
            </div>
            
            <div className="map-stats">
              <div className="stat-item">
                <i className="fas fa-charging-station"></i>
                <span>{stations.length} trạm sạc</span>
              </div>
              <div className="stat-item">
                <i className="fas fa-plug"></i>
                <span>{stations.reduce((sum, s) => sum + s.totalChargers, 0)} cổng sạc</span>
              </div>
              <div className="stat-item">
                <i className="fas fa-check-circle"></i>
                <span>{stations.reduce((sum, s) => sum + s.availableChargers, 0)} cổng trống</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HomePageMap;

