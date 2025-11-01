// src/components/MapPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import StationCard from './StationCard';
import { getAllStations, getStationChargers } from '../services/stationService';
import { debounce } from '../utils/performance';
import 'leaflet/dist/leaflet.css';
import '../styles/MapPage.css';

// Fix for default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapPage = () => {
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [range, setRange] = useState('5km');
  const [availability, setAvailability] = useState('all');
  const [userLocation, setUserLocation] = useState(null); // { lat, lng }
  const [mapCenter, setMapCenter] = useState([10.762622, 106.660172]); // [lat, lng] - Default to Ho Chi Minh City
  const [mapZoom, setMapZoom] = useState(13);

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

              // Extract charger types
              const chargerTypes = chargers.map(c => {
                const type = c.chargerType || c.type || 'Unknown';
                return type.replace('_', ' '); // AC_Type2 -> AC Type2
              });

              // Calculate distance if user location available
              let distance = null;
              if (userLocation && locationData.latitude && locationData.longitude) {
                distance = calculateDistance(
                  userLocation.lat, userLocation.lng,
                  locationData.latitude, locationData.longitude
                );
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
                rating: station.rating ? parseFloat(station.rating) : 0,
                reviews: Math.floor(Math.random() * 200) + 10, // Mock reviews count
                types: chargerTypes.length > 0 ? chargerTypes : ['CCS', 'AC Type2'],
                price: '4.500 VNĐ/kWh', // Default price, can be from station config
                distance: distance ? `${distance.toFixed(1)} km` : null,
                status: station.status || 'online',
                chargers: chargers,
                locationData: locationData
              };
            } catch (err) {
              console.error(`Error processing station ${station.stationId}:`, err);
              return null;
            }
          })
        );

    // Filter out null stations
    const validStations = transformedStations.filter(s => s !== null);
    setStations(validStations);
    setFilteredStations(validStations);
    
    // Update map center to first station or user location
    if (validStations.length > 0 && validStations[0].latitude && validStations[0].longitude) {
      setMapCenter([validStations[0].latitude, validStations[0].longitude]);
      setMapZoom(12);
    } else if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
    }
      } catch (err) {
        console.error('Failed to load stations:', err);
        setError(err.response?.data?.message || err.message || 'Không thể tải danh sách trạm sạc');
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, [userLocation]);

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
        }
      );
    } else {
      // Default to Ho Chi Minh City center
      setUserLocation({ lat: 10.762622, lng: 106.660172 });
    }
  }, []);

  // Memoized filter function
  const filterStations = useCallback((stationsList, searchTerm, rangeValue, availabilityValue) => {
    let filtered = [...stationsList];

    // Search filter
    if (searchTerm?.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(station => 
        station.name?.toLowerCase().includes(searchLower) ||
        station.address?.toLowerCase().includes(searchLower) ||
        station.district?.toLowerCase().includes(searchLower)
      );
    }

    // Availability filter
    // Note: Chỉ trạm online mới có thể đặt chỗ và sạc
    if (availabilityValue === 'available') {
      filtered = filtered.filter(station => 
        station.status === 'online' &&
        station.chargers?.some(c => c.status === 'available')
      );
    } else if (availabilityValue === 'in_use') {
      filtered = filtered.filter(station => 
        station.status === 'online' &&
        station.chargers?.some(c => c.status === 'in_use')
      );
    }

    // Range filter (if user location available)
    if (userLocation && rangeValue !== 'all') {
      const maxDistance = parseInt(rangeValue.replace('km', ''));
      filtered = filtered.filter(station => {
        if (!station.distance) return false;
        const distance = parseFloat(station.distance.replace(' km', ''));
        return distance <= maxDistance;
      });
    }

    return filtered;
  }, [userLocation]);

  // Debounced search handler
  const debouncedFilter = useMemo(
    () => debounce((searchTerm) => {
      const filtered = filterStations(stations, searchTerm, range, availability);
      setFilteredStations(filtered);
      
      // Update map center when stations are filtered
      if (filtered.length > 0 && filtered[0].latitude && filtered[0].longitude) {
        setMapCenter([filtered[0].latitude, filtered[0].longitude]);
      }
    }, 300),
    [stations, range, availability, filterStations]
  );

  // Filter on search change (debounced)
  useEffect(() => {
    debouncedFilter(search);
  }, [search, debouncedFilter]);

  // Filter on range/availability change (immediate)
  useEffect(() => {
    const filtered = filterStations(stations, search, range, availability);
    setFilteredStations(filtered);
    
    if (filtered.length > 0 && filtered[0].latitude && filtered[0].longitude) {
      setMapCenter([filtered[0].latitude, filtered[0].longitude]);
    }
  }, [range, availability, stations, search, filterStations]);

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

  return (
    <div className="map-page">
      <div className="search-bar">
        <div className="search-input-wrapper">
          <i className="fas fa-location-dot"></i>
              <input
                type="text"
                placeholder="Nhập địa điểm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Tìm kiếm trạm sạc"
              />
        </div>
        <select value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="all">Tất cả khoảng cách</option>
          <option value="5km">Trong 5km</option>
          <option value="10km">Trong 10km</option>
          <option value="20km">Trong 20km</option>
        </select>
        <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
          <option value="all">Tất cả cổng sạc</option>
          <option value="available">Đang trống</option>
          <option value="in_use">Đang sử dụng</option>
        </select>
        <label className="toggle">
          <input type="checkbox" />
          <span>Đang hoạt động</span>
        </label>
        <button className="btn-search">
          <i className="fas fa-search"></i> Tìm kiếm
        </button>
      </div>

      <div className="map-content">
        <div className="station-list">
          <div className="list-header">
            <p>
              {loading ? (
                'Đang tải...'
              ) : error ? (
                <span style={{ color: 'red' }}>{error}</span>
              ) : (
                <>
                  Tìm thấy <strong>{filteredStations.length}</strong> trạm sạc
                  {search ? ` cho "${search}"` : ' trong khu vực'}
                </>
              )}
            </p>
            <select>
              <option>Sắp xếp theo: Khoảng cách</option>
              <option>Giá thấp nhất</option>
              <option>Đánh giá cao</option>
            </select>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Đang tải danh sách trạm sạc...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <i className="fas fa-exclamation-triangle"></i>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Thử lại</button>
            </div>
          ) : filteredStations.length === 0 ? (
            <div className="empty-container">
              <i className="fas fa-map-marker-alt"></i>
              <p>Không tìm thấy trạm sạc nào</p>
              {search && (
                <button onClick={() => setSearch('')}>Xóa bộ lọc</button>
              )}
            </div>
          ) : (
            filteredStations.map(station => (
              <StationCard key={station.id} station={station} />
            ))
          )}
        </div>

        <div className="map-container">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* User location marker */}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>
                  <strong>Vị trí của bạn</strong>
                </Popup>
              </Marker>
            )}
            {/* Station markers */}
            {filteredStations
              .filter(station => station.latitude && station.longitude)
              .map(station => (
                <Marker
                  key={station.id}
                  position={[station.latitude, station.longitude]}
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
                    <div>
                      <strong>{station.name}</strong>
                      <br />
                      <small>{station.address}</small>
                      {station.distance && (
                        <>
                          <br />
                          <small>Khoảng cách: {station.distance}</small>
                        </>
                      )}
                      <br />
                      <small>
                        {station.chargers?.filter(c => c.status === 'available').length || 0}/
                        {station.chargers?.length || 0} cổng trống
                      </small>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapPage;