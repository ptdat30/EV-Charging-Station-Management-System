import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/map.css";

const MapPage = () => {
    useEffect(() => {
        // Khởi tạo bản đồ
        const map = L.map("map").setView([10.762622, 106.660172], 13); // Vị trí mặc định: TP.HCM

        // Thêm layer bản đồ (OpenStreetMap)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a>',
        }).addTo(map);

        // Ví dụ thêm marker
        L.marker([10.762622, 106.660172])
            .addTo(map)
            .bindPopup("<b>Trạm sạc EV Demo</b><br/>Quận 1, TP.HCM")
            .openPopup();

        return () => {
            map.remove(); // cleanup khi rời trang
        };
    }, []);

    return (
        <div className="app-container">
            <header className="header">
                <div className="header-content">
                    <div className="logo">
                        <i className="fas fa-charging-station"></i>
                        <span>EV Finder</span>
                    </div>
                    <div className="search-container">
                        <div className="search-box">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Tìm kiếm trạm sạc, địa điểm..."
                                id="searchInput"
                            />
                            <button className="filter-btn" id="filterBtn">
                                <i className="fas fa-filter"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="main-content">
                <div className="map-section">
                    <div id="map" className="map-container"></div>
                </div>

                <div className="station-list-section">
                    <div className="section-header">
                        <h2>Trạm sạc gần bạn</h2>
                        <button className="view-all-btn">Xem tất cả</button>
                    </div>
                    <div className="station-list" id="stationList">
                        <p>Chưa có dữ liệu trạm sạc.</p>
                    </div>
                </div>
            </main>

            <nav className="bottom-nav">
                <a href="#" className="nav-item active">
                    <i className="fas fa-map"></i>
                    <span>Bản đồ</span>
                </a>
                <a href="#" className="nav-item">
                    <i className="fas fa-heart"></i>
                    <span>Yêu thích</span>
                </a>
                <a href="#" className="nav-item">
                    <i className="fas fa-clock"></i>
                    <span>Lịch sử</span>
                </a>
                <a href="#" className="nav-item">
                    <i className="fas fa-user"></i>
                    <span>Tài khoản</span>
                </a>
            </nav>
        </div>
    );
};

export default MapPage;
