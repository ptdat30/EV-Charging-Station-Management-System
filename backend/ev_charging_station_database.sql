-- =============================================
-- EV Charging Station Management System Database
-- MySQL Database Script
-- =============================================

-- Tạo database
CREATE DATABASE IF NOT EXISTS ev_charging_station_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE ev_charging_station_db;

-- =============================================
-- BẢNG QUẢN LÝ NGƯỜI DÙNG
-- =============================================

-- Bảng Users - Quản lý tất cả người dùng (drivers, staff, admins)
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender ENUM('MALE', 'FEMALE', 'OTHER'),
    address TEXT,
    user_type ENUM('DRIVER', 'STAFF', 'ADMIN') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    profile_image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_user_type (user_type),
    INDEX idx_status (status)
);

-- Bảng Staff - Thông tin nhân viên trạm sạc
CREATE TABLE staff (
    staff_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    station_id BIGINT,
    position VARCHAR(50) NOT NULL,
    hire_date DATE NOT NULL,
    salary DECIMAL(10,2),
    work_shift ENUM('MORNING', 'AFTERNOON', 'EVENING', 'NIGHT') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'ON_LEAVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_employee_id (employee_id),
    INDEX idx_station_id (station_id)
);

-- =============================================
-- BẢNG QUẢN LÝ TRẠM SẠC VÀ ĐIỂM SẠC
-- =============================================

-- Bảng ChargingStations - Quản lý trạm sạc
CREATE TABLE charging_stations (
    station_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_name VARCHAR(100) NOT NULL,
    station_code VARCHAR(20) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    ward VARCHAR(50),
    contact_phone VARCHAR(15),
    contact_email VARCHAR(100),
    operating_hours JSON, -- {"monday": "06:00-22:00", "tuesday": "06:00-22:00", ...}
    amenities JSON, -- ["parking", "restroom", "cafe", "wifi"]
    total_charging_points INT DEFAULT 0,
    available_charging_points INT DEFAULT 0,
    status ENUM('ACTIVE', 'MAINTENANCE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_station_code (station_code),
    INDEX idx_location (latitude, longitude),
    INDEX idx_city_district (city, district),
    INDEX idx_status (status)
);

-- Bảng ChargingPoints - Quản lý điểm sạc trong mỗi trạm
CREATE TABLE charging_points (
    point_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_id BIGINT NOT NULL,
    point_number VARCHAR(10) NOT NULL, -- Số thứ tự điểm sạc trong trạm
    connector_type ENUM('CCS', 'CHAdeMO', 'AC_TYPE2', 'DC_FAST') NOT NULL,
    power_rating_kw DECIMAL(5,2) NOT NULL, -- Công suất (kW)
    voltage_rating INT, -- Điện áp (V)
    current_rating INT, -- Dòng điện (A)
    price_per_kwh DECIMAL(8,2) NOT NULL, -- Giá mỗi kWh
    price_per_minute DECIMAL(8,2), -- Giá mỗi phút (nếu tính theo thời gian)
    status ENUM('AVAILABLE', 'OCCUPIED', 'OUT_OF_ORDER', 'MAINTENANCE') DEFAULT 'AVAILABLE',
    qr_code VARCHAR(255) UNIQUE,
    last_maintenance DATE,
    next_maintenance DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES charging_stations(station_id) ON DELETE CASCADE,
    UNIQUE KEY unique_station_point (station_id, point_number),
    INDEX idx_station_id (station_id),
    INDEX idx_connector_type (connector_type),
    INDEX idx_status (status),
    INDEX idx_qr_code (qr_code)
);

-- =============================================
-- BẢNG QUẢN LÝ PHƯƠNG TIỆN VÀ ĐẶT CHỖ
-- =============================================

-- Bảng Vehicles - Thông tin xe của tài xế
CREATE TABLE vehicles (
    vehicle_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type ENUM('CAR', 'MOTORCYCLE', 'BUS', 'TRUCK') NOT NULL,
    brand VARCHAR(50),
    model VARCHAR(50),
    year_manufactured YEAR,
    battery_capacity_kwh DECIMAL(6,2), -- Dung lượng pin (kWh)
    max_charging_power_kw DECIMAL(5,2), -- Công suất sạc tối đa (kW)
    compatible_connectors JSON, -- ["CCS", "CHAdeMO", "AC_TYPE2"]
    color VARCHAR(30),
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_license_plate (license_plate),
    INDEX idx_vehicle_type (vehicle_type)
);

-- Bảng Bookings - Đặt chỗ trước
CREATE TABLE bookings (
    booking_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    station_id BIGINT NOT NULL,
    point_id BIGINT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    estimated_cost DECIMAL(10,2),
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW') DEFAULT 'PENDING',
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES charging_stations(station_id) ON DELETE CASCADE,
    FOREIGN KEY (point_id) REFERENCES charging_points(point_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_station_id (station_id),
    INDEX idx_point_id (point_id),
    INDEX idx_booking_date (booking_date),
    INDEX idx_status (status)
);

-- =============================================
-- BẢNG QUẢN LÝ PHIÊN SẠC VÀ THANH TOÁN
-- =============================================

-- Bảng ChargingSessions - Phiên sạc
CREATE TABLE charging_sessions (
    session_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    station_id BIGINT NOT NULL,
    point_id BIGINT NOT NULL,
    booking_id BIGINT NULL, -- Có thể null nếu không đặt chỗ trước
    session_code VARCHAR(20) UNIQUE NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NULL,
    start_battery_level DECIMAL(5,2), -- Mức pin bắt đầu (%)
    end_battery_level DECIMAL(5,2), -- Mức pin kết thúc (%)
    energy_consumed_kwh DECIMAL(8,2) DEFAULT 0, -- Năng lượng tiêu thụ (kWh)
    charging_duration_minutes INT DEFAULT 0, -- Thời gian sạc (phút)
    total_cost DECIMAL(10,2) DEFAULT 0, -- Tổng chi phí
    payment_method ENUM('CREDIT_CARD', 'DEBIT_CARD', 'E_WALLET', 'BANK_TRANSFER', 'CASH') NOT NULL,
    payment_status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    session_status ENUM('ACTIVE', 'COMPLETED', 'INTERRUPTED', 'FAILED') DEFAULT 'ACTIVE',
    interruption_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES charging_stations(station_id) ON DELETE CASCADE,
    FOREIGN KEY (point_id) REFERENCES charging_points(point_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_station_id (station_id),
    INDEX idx_point_id (point_id),
    INDEX idx_session_code (session_code),
    INDEX idx_start_time (start_time),
    INDEX idx_payment_status (payment_status),
    INDEX idx_session_status (session_status)
);

-- Bảng Payments - Chi tiết thanh toán
CREATE TABLE payments (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    payment_method ENUM('CREDIT_CARD', 'DEBIT_CARD', 'E_WALLET', 'BANK_TRANSFER', 'CASH') NOT NULL,
    payment_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    transaction_id VARCHAR(100) UNIQUE, -- ID giao dịch từ payment gateway
    payment_gateway VARCHAR(50), -- VNPay, MoMo, ZaloPay, etc.
    payment_status ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED') DEFAULT 'PENDING',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    refund_date TIMESTAMP NULL,
    refund_reason TEXT,
    invoice_number VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES charging_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_payment_date (payment_date)
);

-- =============================================
-- BẢNG QUẢN LÝ GÓI DỊCH VỤ VÀ ĐĂNG KÝ
-- =============================================

-- Bảng ServicePackages - Gói dịch vụ đăng ký
CREATE TABLE service_packages (
    package_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    package_name VARCHAR(100) NOT NULL,
    package_type ENUM('PREPAID', 'POSTPAID', 'VIP_MEMBER') NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_days INT NOT NULL, -- Thời hạn gói (ngày)
    energy_limit_kwh DECIMAL(8,2), -- Giới hạn năng lượng (kWh)
    discount_percentage DECIMAL(5,2) DEFAULT 0, -- Phần trăm giảm giá
    benefits JSON, -- ["priority_booking", "free_maintenance", "24h_support"]
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_package_type (package_type),
    INDEX idx_status (status)
);

-- Bảng UserSubscriptions - Đăng ký gói dịch vụ của người dùng
CREATE TABLE user_subscriptions (
    subscription_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    remaining_energy_kwh DECIMAL(8,2), -- Năng lượng còn lại
    status ENUM('ACTIVE', 'EXPIRED', 'CANCELLED') DEFAULT 'ACTIVE',
    auto_renewal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES service_packages(package_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_package_id (package_id),
    INDEX idx_status (status),
    INDEX idx_end_date (end_date)
);

-- =============================================
-- BẢNG QUẢN LÝ BÁO CÁO VÀ THỐNG KÊ
-- =============================================

-- Bảng Reports - Báo cáo và thống kê
CREATE TABLE reports (
    report_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_type ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM') NOT NULL,
    report_name VARCHAR(100) NOT NULL,
    station_id BIGINT NULL, -- NULL nếu báo cáo toàn hệ thống
    generated_by BIGINT NOT NULL, -- User ID của người tạo báo cáo
    report_data JSON, -- Dữ liệu báo cáo dạng JSON
    start_date DATE,
    end_date DATE,
    total_sessions INT DEFAULT 0,
    total_energy_kwh DECIMAL(12,2) DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    average_session_duration DECIMAL(8,2) DEFAULT 0, -- phút
    peak_hours JSON, -- {"08:00-09:00": 25, "18:00-19:00": 30}
    status ENUM('GENERATING', 'COMPLETED', 'FAILED') DEFAULT 'GENERATING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES charging_stations(station_id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_report_type (report_type),
    INDEX idx_station_id (station_id),
    INDEX idx_generated_by (generated_by),
    INDEX idx_created_at (created_at)
);

-- Bảng Notifications - Thông báo
CREATE TABLE notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('INFO', 'WARNING', 'SUCCESS', 'ERROR') DEFAULT 'INFO',
    category ENUM('BOOKING', 'CHARGING', 'PAYMENT', 'MAINTENANCE', 'SYSTEM') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_notification_type (notification_type),
    INDEX idx_category (category),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- =============================================
-- BẢNG QUẢN LÝ HỆ THỐNG
-- =============================================

-- Bảng SystemLogs - Log hệ thống
CREATE TABLE system_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity_type (entity_type),
    INDEX idx_created_at (created_at)
);

-- Bảng MaintenanceRecords - Lịch sử bảo trì
CREATE TABLE maintenance_records (
    maintenance_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_id BIGINT NOT NULL,
    point_id BIGINT NULL, -- NULL nếu bảo trì toàn trạm
    maintenance_type ENUM('SCHEDULED', 'EMERGENCY', 'REPAIR', 'UPGRADE') NOT NULL,
    description TEXT NOT NULL,
    performed_by BIGINT NOT NULL, -- Staff ID
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NULL,
    status ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
    cost DECIMAL(10,2),
    parts_replaced JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES charging_stations(station_id) ON DELETE CASCADE,
    FOREIGN KEY (point_id) REFERENCES charging_points(point_id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES staff(staff_id) ON DELETE CASCADE,
    INDEX idx_station_id (station_id),
    INDEX idx_point_id (point_id),
    INDEX idx_maintenance_type (maintenance_type),
    INDEX idx_status (status),
    INDEX idx_start_time (start_time)
);

-- =============================================
-- TRIGGERS VÀ STORED PROCEDURES
-- =============================================

-- Trigger cập nhật số lượng charging points khi thêm/xóa điểm sạc
DELIMITER //
CREATE TRIGGER update_station_charging_points_count
AFTER INSERT ON charging_points
FOR EACH ROW
BEGIN
    UPDATE charging_stations 
    SET total_charging_points = total_charging_points + 1,
        available_charging_points = available_charging_points + 1
    WHERE station_id = NEW.station_id;
END//

CREATE TRIGGER update_station_charging_points_count_delete
AFTER DELETE ON charging_points
FOR EACH ROW
BEGIN
    UPDATE charging_stations 
    SET total_charging_points = total_charging_points - 1,
        available_charging_points = available_charging_points - 1
    WHERE station_id = OLD.station_id;
END//

CREATE TRIGGER update_available_charging_points
AFTER UPDATE ON charging_points
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        IF NEW.status = 'AVAILABLE' AND OLD.status != 'AVAILABLE' THEN
            UPDATE charging_stations 
            SET available_charging_points = available_charging_points + 1
            WHERE station_id = NEW.station_id;
        ELSEIF NEW.status != 'AVAILABLE' AND OLD.status = 'AVAILABLE' THEN
            UPDATE charging_stations 
            SET available_charging_points = available_charging_points - 1
            WHERE station_id = NEW.station_id;
        END IF;
    END IF;
END//
DELIMITER ;

-- =============================================
-- VIEWS
-- =============================================

-- View thống kê tổng quan trạm sạc
CREATE VIEW station_overview AS
SELECT 
    cs.station_id,
    cs.station_name,
    cs.station_code,
    cs.city,
    cs.district,
    cs.status as station_status,
    cs.total_charging_points,
    cs.available_charging_points,
    COUNT(cp.point_id) as actual_charging_points,
    SUM(CASE WHEN cp.status = 'AVAILABLE' THEN 1 ELSE 0 END) as actual_available_points,
    AVG(cp.price_per_kwh) as avg_price_per_kwh
FROM charging_stations cs
LEFT JOIN charging_points cp ON cs.station_id = cp.station_id
GROUP BY cs.station_id, cs.station_name, cs.station_code, cs.city, cs.district, cs.status, cs.total_charging_points, cs.available_charging_points;

-- View thống kê doanh thu theo tháng
CREATE VIEW monthly_revenue AS
SELECT 
    YEAR(cs.start_time) as year,
    MONTH(cs.start_time) as month,
    COUNT(cs.session_id) as total_sessions,
    SUM(cs.energy_consumed_kwh) as total_energy_kwh,
    SUM(cs.total_cost) as total_revenue,
    AVG(cs.charging_duration_minutes) as avg_duration_minutes,
    COUNT(DISTINCT cs.user_id) as unique_users
FROM charging_sessions cs
WHERE cs.session_status = 'COMPLETED'
GROUP BY YEAR(cs.start_time), MONTH(cs.start_time)
ORDER BY year DESC, month DESC;

-- =============================================
-- INDEXES BỔ SUNG CHO PERFORMANCE
-- =============================================

-- Composite indexes cho các query phổ biến
CREATE INDEX idx_charging_sessions_user_date ON charging_sessions(user_id, start_time);
CREATE INDEX idx_charging_sessions_station_date ON charging_sessions(station_id, start_time);
CREATE INDEX idx_bookings_user_date_status ON bookings(user_id, booking_date, status);
CREATE INDEX idx_payments_user_date ON payments(user_id, payment_date);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at);

-- =============================================
-- CONSTRAINTS VÀ VALIDATION
-- =============================================

-- Ràng buộc dữ liệu
ALTER TABLE charging_points 
ADD CONSTRAINT chk_power_rating_positive CHECK (power_rating_kw > 0);

ALTER TABLE charging_points 
ADD CONSTRAINT chk_price_positive CHECK (price_per_kwh > 0);

ALTER TABLE charging_sessions 
ADD CONSTRAINT chk_start_end_time CHECK (end_time IS NULL OR end_time > start_time);

ALTER TABLE charging_sessions 
ADD CONSTRAINT chk_battery_level CHECK (start_battery_level >= 0 AND start_battery_level <= 100);

ALTER TABLE bookings 
ADD CONSTRAINT chk_booking_time CHECK (end_time > start_time);

ALTER TABLE service_packages 
ADD CONSTRAINT chk_package_price_positive CHECK (price > 0);

ALTER TABLE service_packages 
ADD CONSTRAINT chk_duration_positive CHECK (duration_days > 0);

-- =============================================
-- GRANTS VÀ PERMISSIONS (Tùy chọn)
-- =============================================

-- Tạo user cho ứng dụng (uncomment và thay đổi password)
-- CREATE USER 'ev_charging_app'@'localhost' IDENTIFIED BY 'your_secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ev_charging_station_db.* TO 'ev_charging_app'@'localhost';
-- FLUSH PRIVILEGES;

-- =============================================
-- KẾT THÚC SCRIPT
-- =============================================

-- Hiển thị thông tin database đã tạo
SELECT 'EV Charging Station Database created successfully!' as message;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'ev_charging_station_db';
