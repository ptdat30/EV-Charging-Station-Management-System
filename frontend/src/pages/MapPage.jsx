import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
// import "leaflet/dist/leaflet.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../styles/map.css";

const MapPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const mapRef = useRef(null);

    useEffect(() => {
        // Khởi tạo bản đồ
        const map = L.map("map", {
            zoomControl: false,
        }).setView([10.762622, 106.660172], 13);

        mapRef.current = map;

        // Layer bản đồ nền
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Thêm marker demo
        const marker = L.marker([10.762622, 106.660172])
            .addTo(map)
            .bindPopup("<b>Trạm sạc EV Demo</b><br/>Quận 1, TP.HCM")
            .openPopup();

        // Giả lập tải bản đồ
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        // Xử lý lỗi bản đồ
        map.on("tileerror", () => {
            console.error("Lỗi khi tải bản đồ");
            setIsLoading(false);
        });

        // Cleanup khi component unmount
        return () => map.remove();
    }, []);

    // Xử lý tìm kiếm
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        // TODO: Thêm logic tìm kiếm (gợi ý: sử dụng API như Nominatim cho OpenStreetMap)
    };

    const clearSearch = () => {
        setSearchQuery("");
    };

    // Xử lý nút định vị
    const handleLocate = () => {
        if (navigator.geolocation) {
            setIsLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    mapRef.current.setView([latitude, longitude], 15);
                    L.marker([latitude, longitude])
                        .addTo(mapRef.current)
                        .bindPopup("Vị trí của bạn")
                        .openPopup();
                    setIsLoading(false);
                },
                (error) => {
                    console.error("Lỗi định vị:", error);
                    setIsLoading(false);
                    alert("Không thể lấy vị trí. Vui lòng kiểm tra quyền truy cập định vị.");
                }
            );
        } else {
            alert("Trình duyệt không hỗ trợ định vị.");
        }
    };

    // Xử lý zoom
    const handleZoomIn = () => {
        mapRef.current.zoomIn();
    };

    const handleZoomOut = () => {
        mapRef.current.zoomOut();
    };

    return (
        <div className="app-container">
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <div className="logo">
                        <span className="blinking">E-CHARGE STATION</span>
                    </div>
                    <div className="search-container">
                        <div className={`search-box ${searchQuery ? "has-content" : ""}`}>
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Tìm kiếm trạm sạc..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                aria-label="Tìm kiếm trạm sạc"
                            />
                            {searchQuery && (
                                <button className="clear-btn" onClick={clearSearch} aria-label="Xóa tìm kiếm">
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Nội dung chính */}
            <main className="main-content">
                <div className="map-section">
                    {isLoading && (
                        <div className="loading-overlay">
                            <div className="spinner"></div>
                        </div>
                    )}
                    <div id="map" className="map-container"></div>

                    {/* Các nút điều khiển */}
                    <div className="map-controls">
                        <button
                            className="control-btn"
                            onClick={handleLocate}
                            data-tooltip="Định vị của bạn"
                            aria-label="Định vị vị trí hiện tại"
                        >
                            <i className="fas fa-location-dot"></i>
                        </button>
                        <button
                            className="control-btn"
                            onClick={handleZoomIn}
                            data-tooltip="Phóng to"
                            aria-label="Phóng to bản đồ"
                        >
                            <i className="fas fa-plus"></i>
                        </button>
                        <button
                            className="control-btn"
                            onClick={handleZoomOut}
                            data-tooltip="Thu nhỏ"
                            aria-label="Thu nhỏ bản đồ"
                        >
                            <i className="fas fa-minus"></i>
                        </button>
                    </div>
                </div>
            </main>

            {/* Thanh điều hướng dưới */}
            <nav className="bottom-nav">
                <a href="#" className="nav-item active" aria-label="Bản đồ">
                    <i className="fas fa-map"></i>
                    <span>Bản đồ</span>
                </a>
                <a href="#" className="nav-item" aria-label="Yêu thích">
                    <i className="fas fa-heart"></i>
                    <span>Yêu thích</span>
                </a>
                <a href="#" className="nav-item" aria-label="Lịch sử">
                    <i className="fas fa-clock"></i>
                    <span>Lịch sử</span>
                </a>
                <a href="#" className="nav-item" aria-label="Tài khoản">
                    <i className="fas fa-user"></i>
                    <span>Tài khoản</span>
                </a>
            </nav>
        </div>
    );
};

export default MapPage;