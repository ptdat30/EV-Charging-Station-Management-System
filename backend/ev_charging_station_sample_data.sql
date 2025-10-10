-- =============================================
-- EV Charging Station Management System - Sample Data
-- MySQL Sample Data Script
-- =============================================

USE ev_charging_station_db;

-- =============================================
-- XÓA DỮ LIỆU CŨ (NẾU CÓ)
-- =============================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
TRUNCATE TABLE system_logs;
TRUNCATE TABLE maintenance_records;
TRUNCATE TABLE reports;
TRUNCATE TABLE user_subscriptions;
TRUNCATE TABLE service_packages;
TRUNCATE TABLE payments;
TRUNCATE TABLE charging_sessions;
TRUNCATE TABLE bookings;
TRUNCATE TABLE vehicles;
TRUNCATE TABLE charging_points;
TRUNCATE TABLE charging_stations;
TRUNCATE TABLE staff;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- THÊM DỮ LIỆU NGƯỜI DÙNG
-- =============================================

-- Thêm Admin
INSERT INTO users (username, email, phone, password_hash, full_name, date_of_birth, gender, address, user_type, status, email_verified, phone_verified) VALUES
('admin001', 'admin@evcharging.vn', '0901234567', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Nguyễn Văn Admin', '1985-03-15', 'MALE', '123 Đường ABC, Quận 1, TP.HCM', 'ADMIN', 'ACTIVE', TRUE, TRUE),
('admin002', 'admin2@evcharging.vn', '0901234568', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Trần Thị Admin', '1990-07-20', 'FEMALE', '456 Đường XYZ, Quận 2, TP.HCM', 'ADMIN', 'ACTIVE', TRUE, TRUE);

-- Thêm Staff
INSERT INTO users (username, email, phone, password_hash, full_name, date_of_birth, gender, address, user_type, status, email_verified, phone_verified) VALUES
('staff001', 'staff001@evcharging.vn', '0901234569', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Lê Văn Nhân Viên', '1992-05-10', 'MALE', '789 Đường DEF, Quận 3, TP.HCM', 'STAFF', 'ACTIVE', TRUE, TRUE),
('staff002', 'staff002@evcharging.vn', '0901234570', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Phạm Thị Nhân Viên', '1988-12-03', 'FEMALE', '321 Đường GHI, Quận 4, TP.HCM', 'STAFF', 'ACTIVE', TRUE, TRUE),
('staff003', 'staff003@evcharging.vn', '0901234571', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Hoàng Văn Nhân Viên', '1995-08-25', 'MALE', '654 Đường JKL, Quận 5, TP.HCM', 'STAFF', 'ACTIVE', TRUE, TRUE);

-- Thêm Drivers (Tài xế)
INSERT INTO users (username, email, phone, password_hash, full_name, date_of_birth, gender, address, user_type, status, email_verified, phone_verified) VALUES
('driver001', 'driver001@gmail.com', '0901234572', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Nguyễn Văn Tài Xế', '1987-04-12', 'MALE', '987 Đường MNO, Quận 6, TP.HCM', 'DRIVER', 'ACTIVE', TRUE, TRUE),
('driver002', 'driver002@gmail.com', '0901234573', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Trần Thị Tài Xế', '1993-09-18', 'FEMALE', '147 Đường PQR, Quận 7, TP.HCM', 'DRIVER', 'ACTIVE', TRUE, TRUE),
('driver003', 'driver003@gmail.com', '0901234574', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Lê Văn Tài Xế', '1991-11-30', 'MALE', '258 Đường STU, Quận 8, TP.HCM', 'DRIVER', 'ACTIVE', TRUE, TRUE),
('driver004', 'driver004@gmail.com', '0901234575', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Phạm Thị Tài Xế', '1989-01-22', 'FEMALE', '369 Đường VWX, Quận 9, TP.HCM', 'DRIVER', 'ACTIVE', TRUE, TRUE),
('driver005', 'driver005@gmail.com', '0901234576', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Hoàng Văn Tài Xế', '1994-06-14', 'MALE', '741 Đường YZA, Quận 10, TP.HCM', 'DRIVER', 'ACTIVE', TRUE, TRUE);

-- =============================================
-- THÊM DỮ LIỆU TRẠM SẠC
-- =============================================

INSERT INTO charging_stations (station_name, station_code, address, latitude, longitude, city, district, ward, contact_phone, contact_email, operating_hours, amenities, status) VALUES
('Trạm Sạc VinFast Landmark 81', 'VS001', 'Vinhomes Central Park, Quận Bình Thạnh, TP.HCM', 10.7969, 106.7206, 'TP.HCM', 'Bình Thạnh', 'Phường 22', '0281234567', 'landmark81@vinfast.vn', 
 '{"monday": "06:00-22:00", "tuesday": "06:00-22:00", "wednesday": "06:00-22:00", "thursday": "06:00-22:00", "friday": "06:00-22:00", "saturday": "06:00-22:00", "sunday": "06:00-22:00"}',
 '["parking", "restroom", "cafe", "wifi", "shopping"]', 'ACTIVE'),

('Trạm Sạc AEON Mall Tân Phú', 'VS002', 'AEON Mall Tân Phú, Quận Tân Phú, TP.HCM', 10.7637, 106.6160, 'TP.HCM', 'Tân Phú', 'Phường Tân Thành', '0281234568', 'tanphu@vinfast.vn',
 '{"monday": "08:00-22:00", "tuesday": "08:00-22:00", "wednesday": "08:00-22:00", "thursday": "08:00-22:00", "friday": "08:00-22:00", "saturday": "08:00-22:00", "sunday": "08:00-22:00"}',
 '["parking", "restroom", "food_court", "wifi", "shopping"]', 'ACTIVE'),

('Trạm Sạc Big C Thăng Long', 'VS003', 'Big C Thăng Long, Quận 12, TP.HCM', 10.8685, 106.6474, 'TP.HCM', 'Quận 12', 'Phường Tân Chánh Hiệp', '0281234569', 'thanglong@vinfast.vn',
 '{"monday": "07:00-21:00", "tuesday": "07:00-21:00", "wednesday": "07:00-21:00", "thursday": "07:00-21:00", "friday": "07:00-21:00", "saturday": "07:00-21:00", "sunday": "07:00-21:00"}',
 '["parking", "restroom", "supermarket"]', 'ACTIVE'),

('Trạm Sạc Crescent Mall', 'VS004', 'Crescent Mall, Quận 7, TP.HCM', 10.7323, 106.7225, 'TP.HCM', 'Quận 7', 'Phường Tân Phú', '0281234570', 'crescent@vinfast.vn',
 '{"monday": "09:00-22:00", "tuesday": "09:00-22:00", "wednesday": "09:00-22:00", "thursday": "09:00-22:00", "friday": "09:00-22:00", "saturday": "09:00-22:00", "sunday": "09:00-22:00"}',
 '["parking", "restroom", "cafe", "wifi", "shopping", "cinema"]', 'ACTIVE'),

('Trạm Sạc SC VivoCity', 'VS005', 'SC VivoCity, Quận 7, TP.HCM', 10.7297, 106.7229, 'TP.HCM', 'Quận 7', 'Phường Tân Phong', '0281234571', 'vivocity@vinfast.vn',
 '{"monday": "10:00-22:00", "tuesday": "10:00-22:00", "wednesday": "10:00-22:00", "thursday": "10:00-22:00", "friday": "10:00-22:00", "saturday": "10:00-22:00", "sunday": "10:00-22:00"}',
 '["parking", "restroom", "food_court", "wifi", "shopping", "entertainment"]', 'ACTIVE');

-- =============================================
-- THÊM DỮ LIỆU ĐIỂM SẠC
-- =============================================

-- Trạm VS001 - Landmark 81 (8 điểm sạc)
INSERT INTO charging_points (station_id, point_number, connector_type, power_rating_kw, voltage_rating, current_rating, price_per_kwh, price_per_minute, status, qr_code) VALUES
(1, 'P001', 'CCS', 150.00, 400, 375, 4500.00, NULL, 'AVAILABLE', 'QR_VS001_P001_20241201'),
(1, 'P002', 'CHAdeMO', 50.00, 400, 125, 4000.00, NULL, 'AVAILABLE', 'QR_VS001_P002_20241201'),
(1, 'P003', 'AC_TYPE2', 22.00, 400, 32, 3500.00, 100.00, 'AVAILABLE', 'QR_VS001_P003_20241201'),
(1, 'P004', 'DC_FAST', 175.00, 400, 437, 5000.00, NULL, 'AVAILABLE', 'QR_VS001_P004_20241201'),
(1, 'P005', 'CCS', 150.00, 400, 375, 4500.00, NULL, 'OCCUPIED', 'QR_VS001_P005_20241201'),
(1, 'P006', 'CHAdeMO', 50.00, 400, 125, 4000.00, NULL, 'AVAILABLE', 'QR_VS001_P006_20241201'),
(1, 'P007', 'AC_TYPE2', 22.00, 400, 32, 3500.00, 100.00, 'AVAILABLE', 'QR_VS001_P007_20241201'),
(1, 'P008', 'DC_FAST', 175.00, 400, 437, 5000.00, NULL, 'MAINTENANCE', 'QR_VS001_P008_20241201');

-- Trạm VS002 - AEON Tân Phú (6 điểm sạc)
INSERT INTO charging_points (station_id, point_number, connector_type, power_rating_kw, voltage_rating, current_rating, price_per_kwh, price_per_minute, status, qr_code) VALUES
(2, 'P001', 'CCS', 120.00, 400, 300, 4200.00, NULL, 'AVAILABLE', 'QR_VS002_P001_20241201'),
(2, 'P002', 'CHAdeMO', 50.00, 400, 125, 3800.00, NULL, 'AVAILABLE', 'QR_VS002_P002_20241201'),
(2, 'P003', 'AC_TYPE2', 22.00, 400, 32, 3200.00, 90.00, 'AVAILABLE', 'QR_VS002_P003_20241201'),
(2, 'P004', 'CCS', 120.00, 400, 300, 4200.00, NULL, 'OCCUPIED', 'QR_VS002_P004_20241201'),
(2, 'P005', 'AC_TYPE2', 22.00, 400, 32, 3200.00, 90.00, 'AVAILABLE', 'QR_VS002_P005_20241201'),
(2, 'P006', 'DC_FAST', 150.00, 400, 375, 4800.00, NULL, 'AVAILABLE', 'QR_VS002_P006_20241201');

-- Trạm VS003 - Big C Thăng Long (4 điểm sạc)
INSERT INTO charging_points (station_id, point_number, connector_type, power_rating_kw, voltage_rating, current_rating, price_per_kwh, price_per_minute, status, qr_code) VALUES
(3, 'P001', 'CCS', 100.00, 400, 250, 4000.00, NULL, 'AVAILABLE', 'QR_VS003_P001_20241201'),
(3, 'P002', 'AC_TYPE2', 22.00, 400, 32, 3000.00, 80.00, 'AVAILABLE', 'QR_VS003_P002_20241201'),
(3, 'P003', 'CHAdeMO', 50.00, 400, 125, 3600.00, NULL, 'AVAILABLE', 'QR_VS003_P003_20241201'),
(3, 'P004', 'AC_TYPE2', 22.00, 400, 32, 3000.00, 80.00, 'OCCUPIED', 'QR_VS003_P004_20241201');

-- Trạm VS004 - Crescent Mall (6 điểm sạc)
INSERT INTO charging_points (station_id, point_number, connector_type, power_rating_kw, voltage_rating, current_rating, price_per_kwh, price_per_minute, status, qr_code) VALUES
(4, 'P001', 'CCS', 150.00, 400, 375, 4500.00, NULL, 'AVAILABLE', 'QR_VS004_P001_20241201'),
(4, 'P002', 'DC_FAST', 175.00, 400, 437, 5000.00, NULL, 'AVAILABLE', 'QR_VS004_P002_20241201'),
(4, 'P003', 'AC_TYPE2', 22.00, 400, 32, 3500.00, 100.00, 'AVAILABLE', 'QR_VS004_P003_20241201'),
(4, 'P004', 'CHAdeMO', 50.00, 400, 125, 4000.00, NULL, 'AVAILABLE', 'QR_VS004_P004_20241201'),
(4, 'P005', 'CCS', 150.00, 400, 375, 4500.00, NULL, 'AVAILABLE', 'QR_VS004_P005_20241201'),
(4, 'P006', 'AC_TYPE2', 22.00, 400, 32, 3500.00, 100.00, 'OCCUPIED', 'QR_VS004_P006_20241201');

-- Trạm VS005 - SC VivoCity (5 điểm sạc)
INSERT INTO charging_points (station_id, point_number, connector_type, power_rating_kw, voltage_rating, current_rating, price_per_kwh, price_per_minute, status, qr_code) VALUES
(5, 'P001', 'CCS', 120.00, 400, 300, 4200.00, NULL, 'AVAILABLE', 'QR_VS005_P001_20241201'),
(5, 'P002', 'AC_TYPE2', 22.00, 400, 32, 3200.00, 90.00, 'AVAILABLE', 'QR_VS005_P002_20241201'),
(5, 'P003', 'CHAdeMO', 50.00, 400, 125, 3800.00, NULL, 'AVAILABLE', 'QR_VS005_P003_20241201'),
(5, 'P004', 'DC_FAST', 150.00, 400, 375, 4800.00, NULL, 'AVAILABLE', 'QR_VS005_P004_20241201'),
(5, 'P005', 'AC_TYPE2', 22.00, 400, 32, 3200.00, 90.00, 'OCCUPIED', 'QR_VS005_P005_20241201');

-- =============================================
-- THÊM DỮ LIỆU NHÂN VIÊN
-- =============================================

INSERT INTO staff (user_id, employee_id, station_id, position, hire_date, salary, work_shift, status) VALUES
(3, 'EMP001', 1, 'Station Manager', '2023-01-15', 15000000.00, 'MORNING', 'ACTIVE'),
(4, 'EMP002', 2, 'Charging Technician', '2023-03-20', 12000000.00, 'AFTERNOON', 'ACTIVE'),
(5, 'EMP003', 3, 'Customer Service', '2023-05-10', 10000000.00, 'EVENING', 'ACTIVE');

-- =============================================
-- THÊM DỮ LIỆU XE
-- =============================================

INSERT INTO vehicles (user_id, license_plate, vehicle_type, brand, model, year_manufactured, battery_capacity_kwh, max_charging_power_kw, compatible_connectors, color, status) VALUES
(6, '51A-12345', 'CAR', 'VinFast', 'VF8', 2023, 87.7, 150.0, '["CCS", "AC_TYPE2"]', 'Đen', 'ACTIVE'),
(7, '51B-67890', 'CAR', 'Tesla', 'Model 3', 2022, 75.0, 250.0, '["CCS", "AC_TYPE2"]', 'Trắng', 'ACTIVE'),
(8, '51C-11111', 'CAR', 'BYD', 'Atto 3', 2023, 60.48, 80.0, '["CCS", "AC_TYPE2"]', 'Xanh', 'ACTIVE'),
(9, '51D-22222', 'CAR', 'VinFast', 'VF6', 2023, 65.0, 120.0, '["CCS", "AC_TYPE2"]', 'Đỏ', 'ACTIVE'),
(10, '51E-33333', 'CAR', 'Hyundai', 'IONIQ 5', 2022, 77.4, 350.0, '["CCS", "AC_TYPE2"]', 'Xám', 'ACTIVE');

-- =============================================
-- THÊM DỮ LIỆU GÓI DỊCH VỤ
-- =============================================

INSERT INTO service_packages (package_name, package_type, description, price, duration_days, energy_limit_kwh, discount_percentage, benefits, status) VALUES
('Gói Cơ Bản', 'PREPAID', 'Gói sạc cơ bản cho người dùng mới', 500000.00, 30, 100.0, 5.0, '["basic_support"]', 'ACTIVE'),
('Gói Tiết Kiệm', 'PREPAID', 'Gói sạc tiết kiệm với giảm giá', 1000000.00, 60, 250.0, 10.0, '["basic_support", "priority_booking"]', 'ACTIVE'),
('Gói VIP', 'PREPAID', 'Gói sạc VIP với nhiều ưu đãi', 2000000.00, 90, 500.0, 15.0, '["24h_support", "priority_booking", "free_maintenance"]', 'ACTIVE'),
('Gói Doanh Nghiệp', 'POSTPAID', 'Gói sạc cho doanh nghiệp', 5000000.00, 365, NULL, 20.0, '["24h_support", "priority_booking", "invoice_support", "account_manager"]', 'ACTIVE'),
('Gói Thành Viên Vàng', 'VIP_MEMBER', 'Gói thành viên vàng với ưu đãi đặc biệt', 3000000.00, 180, 750.0, 25.0, '["24h_support", "priority_booking", "free_maintenance", "exclusive_events"]', 'ACTIVE');

-- =============================================
-- THÊM DỮ LIỆU ĐĂNG KÝ GÓI DỊCH VỤ
-- =============================================

INSERT INTO user_subscriptions (user_id, package_id, start_date, end_date, remaining_energy_kwh, status, auto_renewal) VALUES
(6, 2, '2024-11-01', '2024-12-31', 180.5, 'ACTIVE', FALSE),
(7, 3, '2024-10-15', '2025-01-13', 420.8, 'ACTIVE', TRUE),
(8, 1, '2024-12-01', '2024-12-31', 85.2, 'ACTIVE', FALSE),
(9, 2, '2024-11-15', '2025-01-14', 200.0, 'ACTIVE', TRUE),
(10, 5, '2024-09-01', '2025-02-28', 650.0, 'ACTIVE', TRUE);

-- =============================================
-- THÊM DỮ LIỆU ĐẶT CHỖ
-- =============================================

INSERT INTO bookings (user_id, vehicle_id, station_id, point_id, booking_date, start_time, end_time, duration_minutes, estimated_cost, status) VALUES
(6, 1, 1, 1, '2024-12-02', '08:00:00', '10:00:00', 120, 150000.00, 'CONFIRMED'),
(7, 2, 2, 4, '2024-12-02', '14:00:00', '15:30:00', 90, 120000.00, 'CONFIRMED'),
(8, 3, 3, 4, '2024-12-03', '10:00:00', '11:00:00', 60, 80000.00, 'PENDING'),
(9, 4, 4, 6, '2024-12-03', '16:00:00', '18:00:00', 120, 160000.00, 'CONFIRMED'),
(10, 5, 5, 5, '2024-12-04', '09:00:00', '10:30:00', 90, 130000.00, 'PENDING');

-- =============================================
-- THÊM DỮ LIỆU PHIÊN SẠC
-- =============================================

INSERT INTO charging_sessions (user_id, vehicle_id, station_id, point_id, booking_id, session_code, start_time, end_time, start_battery_level, end_battery_level, energy_consumed_kwh, charging_duration_minutes, total_cost, payment_method, payment_status, session_status) VALUES
(6, 1, 1, 1, 1, 'CS20241201001', '2024-12-01 08:05:00', '2024-12-01 09:45:00', 25.0, 85.0, 45.2, 100, 203400.00, 'CREDIT_CARD', 'COMPLETED', 'COMPLETED'),
(7, 2, 2, 4, 2, 'CS20241201002', '2024-12-01 14:10:00', '2024-12-01 15:35:00', 30.0, 90.0, 52.8, 85, 190080.00, 'E_WALLET', 'COMPLETED', 'COMPLETED'),
(8, 3, 3, 4, NULL, 'CS20241201003', '2024-12-01 18:20:00', '2024-12-01 19:15:00', 20.0, 75.0, 35.5, 55, 127800.00, 'BANK_TRANSFER', 'COMPLETED', 'COMPLETED'),
(9, 4, 4, 6, 4, 'CS20241201004', '2024-12-01 16:05:00', '2024-12-01 17:50:00', 15.0, 80.0, 48.6, 105, 218700.00, 'CREDIT_CARD', 'COMPLETED', 'COMPLETED'),
(10, 5, 5, 5, NULL, 'CS20241201005', '2024-12-01 09:15:00', '2024-12-01 10:40:00', 35.0, 95.0, 41.3, 85, 185850.00, 'E_WALLET', 'COMPLETED', 'COMPLETED');

-- =============================================
-- THÊM DỮ LIỆU THANH TOÁN
-- =============================================

INSERT INTO payments (session_id, user_id, payment_method, payment_amount, currency, transaction_id, payment_gateway, payment_status, payment_date, invoice_number) VALUES
(1, 6, 'CREDIT_CARD', 203400.00, 'VND', 'TXN20241201001', 'VNPay', 'COMPLETED', '2024-12-01 09:45:00', 'INV20241201001'),
(2, 7, 'E_WALLET', 190080.00, 'VND', 'TXN20241201002', 'MoMo', 'COMPLETED', '2024-12-01 15:35:00', 'INV20241201002'),
(3, 8, 'BANK_TRANSFER', 127800.00, 'VND', 'TXN20241201003', 'Banking', 'COMPLETED', '2024-12-01 19:15:00', 'INV20241201003'),
(4, 9, 'CREDIT_CARD', 218700.00, 'VND', 'TXN20241201004', 'VNPay', 'COMPLETED', '2024-12-01 17:50:00', 'INV20241201004'),
(5, 10, 'E_WALLET', 185850.00, 'VND', 'TXN20241201005', 'ZaloPay', 'COMPLETED', '2024-12-01 10:40:00', 'INV20241201005');

-- =============================================
-- THÊM DỮ LIỆU THÔNG BÁO
-- =============================================

INSERT INTO notifications (user_id, title, message, notification_type, category, is_read) VALUES
(6, 'Đặt chỗ thành công', 'Bạn đã đặt chỗ sạc thành công tại Trạm Sạc VinFast Landmark 81 vào 08:00 ngày 02/12/2024', 'SUCCESS', 'BOOKING', FALSE),
(7, 'Hoàn thành phiên sạc', 'Phiên sạc của bạn đã hoàn thành. Tổng chi phí: 190,080 VNĐ', 'SUCCESS', 'CHARGING', TRUE),
(8, 'Nhắc nhở đặt chỗ', 'Bạn có đặt chỗ sạc tại Big C Thăng Long vào 10:00 ngày mai. Vui lòng đến đúng giờ!', 'INFO', 'BOOKING', FALSE),
(9, 'Gói dịch vụ sắp hết hạn', 'Gói dịch vụ Tiết Kiệm của bạn sẽ hết hạn vào 14/01/2025. Hãy gia hạn để tiếp tục sử dụng!', 'WARNING', 'SYSTEM', FALSE),
(10, 'Phiên sạc hoàn thành', 'Phiên sạc tại SC VivoCity đã hoàn thành. Cảm ơn bạn đã sử dụng dịch vụ!', 'SUCCESS', 'CHARGING', TRUE);

-- =============================================
-- THÊM DỮ LIỆU BÁO CÁO
-- =============================================

INSERT INTO reports (report_type, report_name, station_id, generated_by, report_data, start_date, end_date, total_sessions, total_energy_kwh, total_revenue, average_session_duration, peak_hours, status) VALUES
('MONTHLY', 'Báo cáo tháng 11/2024 - Tổng quan', NULL, 1, '{"stations": 5, "total_points": 29, "utilization_rate": 0.75}', '2024-11-01', '2024-11-30', 245, 1250.5, 5625000.00, 85.5, '{"08:00-09:00": 35, "18:00-19:00": 42}', 'COMPLETED'),
('DAILY', 'Báo cáo ngày 01/12/2024 - Landmark 81', 1, 1, '{"station_name": "Trạm Sạc VinFast Landmark 81", "utilization": 0.625}', '2024-12-01', '2024-12-01', 15, 85.2, 382500.00, 92.0, '{"08:00-09:00": 8, "14:00-15:00": 5, "18:00-19:00": 7}', 'COMPLETED'),
('WEEKLY', 'Báo cáo tuần 48/2024 - AEON Tân Phú', 2, 2, '{"station_name": "Trạm Sạc AEON Mall Tân Phú", "weekly_growth": 0.12}', '2024-11-25', '2024-12-01', 45, 220.8, 993600.00, 78.5, '{"14:00-15:00": 12, "19:00-20:00": 15}', 'COMPLETED');

-- =============================================
-- THÊM DỮ LIỆU BẢO TRÌ
-- =============================================

INSERT INTO maintenance_records (station_id, point_id, maintenance_type, description, performed_by, start_time, end_time, status, cost, parts_replaced, notes) VALUES
(1, 8, 'SCHEDULED', 'Bảo trì định kỳ điểm sạc DC Fast', 1, '2024-11-28 22:00:00', '2024-11-29 02:00:00', 'COMPLETED', 2500000.00, '["connector", "cable"]', 'Thay thế connector và cáp sạc'),
(2, NULL, 'EMERGENCY', 'Sửa chữa hệ thống điện trạm sạc', 2, '2024-11-30 10:00:00', '2024-11-30 16:00:00', 'COMPLETED', 5000000.00, '["power_supply", "cables"]', 'Sửa chữa khẩn cấp hệ thống điện'),
(3, 2, 'REPAIR', 'Sửa chữa màn hình hiển thị', 3, '2024-12-01 09:00:00', '2024-12-01 11:30:00', 'COMPLETED', 1200000.00, '["display_screen"]', 'Thay thế màn hình hiển thị bị hỏng');

-- =============================================
-- THÊM DỮ LIỆU LOG HỆ THỐNG
-- =============================================

INSERT INTO system_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, created_at) VALUES
(6, 'CREATE_BOOKING', 'bookings', 1, NULL, '{"station_id": 1, "point_id": 1, "booking_date": "2024-12-02"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2024-12-01 07:30:00'),
(7, 'START_CHARGING', 'charging_sessions', 2, NULL, '{"session_code": "CS20241201002", "start_time": "2024-12-01 14:10:00"}', '192.168.1.101', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)', '2024-12-01 14:10:00'),
(8, 'UPDATE_VEHICLE', 'vehicles', 3, '{"color": "Đen"}', '{"color": "Xanh"}', '192.168.1.102', 'Mozilla/5.0 (Android 12; Mobile; rv:91.0)', '2024-12-01 16:45:00'),
(1, 'UPDATE_CHARGING_POINT', 'charging_points', 8, '{"status": "AVAILABLE"}', '{"status": "MAINTENANCE"}', '192.168.1.200', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2024-12-01 18:00:00'),
(9, 'PAYMENT_COMPLETED', 'payments', 4, '{"payment_status": "PENDING"}', '{"payment_status": "COMPLETED"}', '192.168.1.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2024-12-01 17:50:00');

-- =============================================
-- CẬP NHẬT THỐNG KÊ SAU KHI THÊM DỮ LIỆU
-- =============================================

-- Cập nhật số lượng charging points cho các trạm
UPDATE charging_stations SET 
    total_charging_points = (SELECT COUNT(*) FROM charging_points WHERE station_id = charging_stations.station_id),
    available_charging_points = (SELECT COUNT(*) FROM charging_points WHERE station_id = charging_stations.station_id AND status = 'AVAILABLE');

-- =============================================
-- KIỂM TRA DỮ LIỆU ĐÃ THÊM
-- =============================================

-- Hiển thị thống kê tổng quan
SELECT '=== THỐNG KÊ TỔNG QUAN ===' as info;
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM users WHERE user_type = 'DRIVER') as total_drivers,
    (SELECT COUNT(*) FROM users WHERE user_type = 'STAFF') as total_staff,
    (SELECT COUNT(*) FROM users WHERE user_type = 'ADMIN') as total_admins,
    (SELECT COUNT(*) FROM charging_stations) as total_stations,
    (SELECT COUNT(*) FROM charging_points) as total_charging_points,
    (SELECT COUNT(*) FROM vehicles) as total_vehicles,
    (SELECT COUNT(*) FROM charging_sessions) as total_sessions,
    (SELECT COUNT(*) FROM bookings) as total_bookings;

-- Hiển thị thông tin trạm sạc
SELECT '=== THÔNG TIN TRẠM SẠC ===' as info;
SELECT 
    station_name,
    station_code,
    city,
    district,
    total_charging_points,
    available_charging_points,
    status
FROM charging_stations
ORDER BY station_id;

-- Hiển thị thông tin phiên sạc gần đây
SELECT '=== PHIÊN SẠC GẦN ĐÂY ===' as info;
SELECT 
    cs.session_code,
    u.full_name as driver_name,
    cs.station_id,
    cs.start_time,
    cs.energy_consumed_kwh,
    cs.total_cost,
    cs.session_status
FROM charging_sessions cs
JOIN users u ON cs.user_id = u.user_id
ORDER BY cs.start_time DESC
LIMIT 5;

SELECT 'Sample data inserted successfully!' as message;

