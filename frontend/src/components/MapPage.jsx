// src/components/MapPage.jsx
import React, { useState } from 'react';
import StationCard from './StationCard';
import '../styles/MapPage.css';

const stations = [
  {
    id: 1,
    name: 'Trạm sạc Vincom Đồng Khởi',
    distance: '0.8 km',
    address: '72 Lê Thánh Tôn, Quận 1, TP.HCM',
    rating: 4.5,
    reviews: 127,
    types: ['Type 2', 'CCS'],
    price: '4.500 VNĐ/kWh',
    image: 'pic_1.png'
  },
  {
    id: 2,
    name: 'Trạm sạc Saigon Centre',
    distance: '1.2 km',
    address: '65 Lê Lợi, Quận 1, TP.HCM',
    rating: 4.8,
    reviews: 98,
    types: ['Tesla', 'Type 2'],
    price: '5.200 VNĐ/kWh',
    image: 'pic_2.jpg'
  },
  {
    id: 3,
    name: 'Trạm sạc Petrolimex Nguyễn Huệ',
    distance: '1.5 km',
    address: '26 Nguyễn Huệ, Quận 1, TP.HCM',
    rating: 4.3,
    reviews: 203,
    types: ['CHAdeMO', 'CCS'],
    price: '3.800 VNĐ/kWh',
    image: 'pic_3.jpg'
  }
];

const MapPage = () => {
  const [search, setSearch] = useState('');
  const [range, setRange] = useState('5km');
  const [availability, setAvailability] = useState('all');

  return (
    <div className="map-page">
      <div className="map-header">
        <h1>Tìm trạm sạc xe điện</h1>
        <p>Trang chủ - Tìm trạm sạc</p>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper">
          <i className="fas fa-location-dot"></i>
          <input
            type="text"
            placeholder="Nhập địa điểm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={range} onChange={(e) => setRange(e.target.value)}>
          <option>Trong 5km</option>
          <option>Trong 10km</option>
          <option>Trong 20km</option>
        </select>
        <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
          <option>Tất cả cổng sạc</option>
          <option>Đang trống</option>
          <option>Đang sử dụng</option>
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
            <p>Tìm thấy <strong>24</strong> trạm sạc trong khu vực</p>
            <select>
              <option>Sắp xếp theo: Khoảng cách</option>
              <option>Giá thấp nhất</option>
              <option>Đánh giá cao</option>
            </select>
          </div>
          {stations.map(station => (
            <StationCard key={station.id} station={station} />
          ))}
        </div>

        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.447!2d106.698!3d10.777!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f!2sHo%20Chi%20Minh%20City!5e0!3m2!1sen!2s!4v1234567890"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default MapPage;