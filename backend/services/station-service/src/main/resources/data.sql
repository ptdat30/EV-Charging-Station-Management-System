-- Script tạo hàng loạt trạm sạc tại TP.HCM
-- Chạy tự động khi Spring Boot khởi động (chỉ trong development)

-- Xóa dữ liệu cũ (nếu cần)
-- DELETE FROM chargers;
-- DELETE FROM stations;

-- Insert các trạm sạc tại TP.HCM
INSERT INTO stations (station_code, station_name, location, status, rating, created_at, updated_at) VALUES
-- Quận 1 - Trung tâm
('HCM-Q1-001', 'Trạm sạc VinFast Quận 1 - Nguyễn Huệ', '{"address": "123 Nguyễn Huệ, Quận 1, TP.HCM", "district": "Quận 1", "city": "Hồ Chí Minh", "latitude": 10.7769, "longitude": 106.7009}', 'online', 4.5, NOW(), NOW()),
('HCM-Q1-002', 'Trạm sạc Đồng Khởi', '{"address": "45 Đồng Khởi, Quận 1, TP.HCM", "district": "Quận 1", "city": "Hồ Chí Minh", "latitude": 10.7794, "longitude": 106.6994}', 'online', 4.3, NOW(), NOW()),
('HCM-Q1-003', 'Trạm sạc Landmark 81', '{"address": "Vinhomes Central Park, Quận Bình Thạnh, TP.HCM", "district": "Quận Bình Thạnh", "city": "Hồ Chí Minh", "latitude": 10.8019, "longitude": 106.7208}', 'online', 4.7, NOW(), NOW()),

-- Quận 3
('HCM-Q3-001', 'Trạm sạc Lê Văn Sỹ', '{"address": "234 Lê Văn Sỹ, Quận 3, TP.HCM", "district": "Quận 3", "city": "Hồ Chí Minh", "latitude": 10.7908, "longitude": 106.6876}', 'online', 4.2, NOW(), NOW()),
('HCM-Q3-002', 'Trạm sạc Nguyễn Đình Chiểu', '{"address": "456 Nguyễn Đình Chiểu, Quận 3, TP.HCM", "district": "Quận 3", "city": "Hồ Chí Minh", "latitude": 10.7956, "longitude": 106.6917}', 'online', 4.4, NOW(), NOW()),

-- Quận 7
('HCM-Q7-001', 'Trạm sạc Phú Mỹ Hưng', '{"address": "Nguyễn Đức Cảnh, Phú Mỹ Hưng, Quận 7, TP.HCM", "district": "Quận 7", "city": "Hồ Chí Minh", "latitude": 10.7314, "longitude": 106.7179}', 'online', 4.6, NOW(), NOW()),
('HCM-Q7-002', 'Trạm sạc Crescent Mall', '{"address": "101 Tôn Dật Tiên, Phú Mỹ Hưng, Quận 7, TP.HCM", "district": "Quận 7", "city": "Hồ Chí Minh", "latitude": 10.7297, "longitude": 106.7192}', 'online', 4.5, NOW(), NOW()),

-- Quận 10
('HCM-Q10-001', 'Trạm sạc Lý Thái Tổ', '{"address": "789 Lý Thái Tổ, Quận 10, TP.HCM", "district": "Quận 10", "city": "Hồ Chí Minh", "latitude": 10.7716, "longitude": 106.6682}', 'online', 4.1, NOW(), NOW()),
('HCM-Q10-002', 'Trạm sạc Nguyễn Tri Phương', '{"address": "321 Nguyễn Tri Phương, Quận 10, TP.HCM", "district": "Quận 10", "city": "Hồ Chí Minh", "latitude": 10.7694, "longitude": 106.6647}', 'online', 4.0, NOW(), NOW()),

-- Quận Bình Thạnh
('HCM-BT-001', 'Trạm sạc Xô Viết Nghệ Tĩnh', '{"address": "567 Xô Viết Nghệ Tĩnh, Quận Bình Thạnh, TP.HCM", "district": "Quận Bình Thạnh", "city": "Hồ Chí Minh", "latitude": 10.8014, "longitude": 106.7143}', 'online', 4.3, NOW(), NOW()),
('HCM-BT-002', 'Trạm sạc Điện Biên Phủ', '{"address": "890 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM", "district": "Quận Bình Thạnh", "city": "Hồ Chí Minh", "latitude": 10.8033, "longitude": 106.7189}', 'online', 4.4, NOW(), NOW()),

-- Quận Tân Bình
('HCM-TB-001', 'Trạm sạc Tân Sơn Nhì', '{"address": "234 Tân Sơn Nhì, Quận Tân Bình, TP.HCM", "district": "Quận Tân Bình", "city": "Hồ Chí Minh", "latitude": 10.8026, "longitude": 106.6447}', 'online', 4.2, NOW(), NOW()),
('HCM-TB-002', 'Trạm sạc Sân Bay Tân Sơn Nhất', '{"address": "Trường Sơn, Quận Tân Bình, TP.HCM", "district": "Quận Tân Bình", "city": "Hồ Chí Minh", "latitude": 10.8188, "longitude": 106.6520}', 'online', 4.6, NOW(), NOW()),

-- Quận Gò Vấp
('HCM-GV-001', 'Trạm sạc Quang Trung', '{"address": "456 Quang Trung, Quận Gò Vấp, TP.HCM", "district": "Quận Gò Vấp", "city": "Hồ Chí Minh", "latitude": 10.8418, "longitude": 106.6711}', 'online', 4.1, NOW(), NOW()),
('HCM-GV-002', 'Trạm sạc Nguyễn Oanh', '{"address": "789 Nguyễn Oanh, Quận Gò Vấp, TP.HCM", "district": "Quận Gò Vấp", "city": "Hồ Chí Minh", "latitude": 10.8477, "longitude": 106.6756}', 'online', 4.0, NOW(), NOW()),

-- Quận Phú Nhuận
('HCM-PN-001', 'Trạm sạc Phan Xích Long', '{"address": "123 Phan Xích Long, Quận Phú Nhuận, TP.HCM", "district": "Quận Phú Nhuận", "city": "Hồ Chí Minh", "latitude": 10.8007, "longitude": 106.6860}', 'online', 4.5, NOW(), NOW()),
('HCM-PN-002', 'Trạm sạc Hoàng Văn Thụ', '{"address": "456 Hoàng Văn Thụ, Quận Phú Nhuận, TP.HCM", "district": "Quận Phú Nhuận", "city": "Hồ Chí Minh", "latitude": 10.7984, "longitude": 106.6833}', 'online', 4.3, NOW(), NOW()),

-- Quận Thủ Đức (thành phố Thủ Đức)
('HCM-TD-001', 'Trạm sạc Khu Công Nghệ Cao', '{"address": "Khu Công Nghệ Cao, Quận 9, TP.HCM", "district": "Quận 9", "city": "Hồ Chí Minh", "latitude": 10.8416, "longitude": 106.8101}', 'online', 4.4, NOW(), NOW()),
('HCM-TD-002', 'Trạm sạc Đại Học Quốc Gia', '{"address": "Đại Học Quốc Gia, Thủ Đức, TP.HCM", "district": "Thủ Đức", "city": "Hồ Chí Minh", "latitude": 10.8700, "longitude": 106.8031}', 'online', 4.6, NOW(), NOW()),
('HCM-TD-003', 'Trạm sạc Quận 2 - Thủ Đức', '{"address": "Nguyễn Thị Định, Quận 2, TP.HCM", "district": "Quận 2", "city": "Hồ Chí Minh", "latitude": 10.7878, "longitude": 106.7508}', 'online', 4.5, NOW(), NOW()),

-- Quận 12
('HCM-Q12-001', 'Trạm sạc Tân Hưng Thuận', '{"address": "123 Tân Hưng Thuận, Quận 12, TP.HCM", "district": "Quận 12", "city": "Hồ Chí Minh", "latitude": 10.8633, "longitude": 106.6300}', 'online', 4.2, NOW(), NOW()),
('HCM-Q12-002', 'Trạm sạc An Phú Đông', '{"address": "456 An Phú Đông, Quận 12, TP.HCM", "district": "Quận 12", "city": "Hồ Chí Minh", "latitude": 10.8717, "longitude": 106.6389}', 'online', 4.0, NOW(), NOW()),

-- Quận Tân Phú
('HCM-TP-001', 'Trạm sạc Tân Sơn Hòa', '{"address": "789 Tân Sơn Hòa, Quận Tân Phú, TP.HCM", "district": "Quận Tân Phú", "city": "Hồ Chí Minh", "latitude": 10.7726, "longitude": 106.6258}', 'online', 4.1, NOW(), NOW()),
('HCM-TP-002', 'Trạm sạc Lê Trọng Tấn', '{"address": "321 Lê Trọng Tấn, Quận Tân Phú, TP.HCM", "district": "Quận Tân Phú", "city": "Hồ Chí Minh", "latitude": 10.7789, "longitude": 106.6311}', 'online', 4.2, NOW(), NOW()),

-- Quận 4
('HCM-Q4-001', 'Trạm sạc Khánh Hội', '{"address": "234 Khánh Hội, Quận 4, TP.HCM", "district": "Quận 4", "city": "Hồ Chí Minh", "latitude": 10.7499, "longitude": 106.6974}', 'online', 4.0, NOW(), NOW()),
('HCM-Q4-002', 'Trạm sạc Nguyễn Tất Thành', '{"address": "567 Nguyễn Tất Thành, Quận 4, TP.HCM", "district": "Quận 4", "city": "Hồ Chí Minh", "latitude": 10.7544, "longitude": 106.7008}', 'online', 4.1, NOW(), NOW()),

-- Quận 5
('HCM-Q5-001', 'Trạm sạc Chợ Lớn', '{"address": "890 Chợ Lớn, Quận 5, TP.HCM", "district": "Quận 5", "city": "Hồ Chí Minh", "latitude": 10.7541, "longitude": 106.6746}', 'online', 4.2, NOW(), NOW()),
('HCM-Q5-002', 'Trạm sạc Nguyễn Trãi', '{"address": "123 Nguyễn Trãi, Quận 5, TP.HCM", "district": "Quận 5", "city": "Hồ Chí Minh", "latitude": 10.7567, "longitude": 106.6772}', 'online', 4.3, NOW(), NOW()),

-- Quận 6
('HCM-Q6-001', 'Trạm sạc Hậu Giang', '{"address": "456 Hậu Giang, Quận 6, TP.HCM", "district": "Quận 6", "city": "Hồ Chí Minh", "latitude": 10.7478, "longitude": 106.6394}', 'online', 4.1, NOW(), NOW()),
('HCM-Q6-002', 'Trạm sạc An Dương Vương', '{"address": "789 An Dương Vương, Quận 6, TP.HCM", "district": "Quận 6", "city": "Hồ Chí Minh", "latitude": 10.7511, "longitude": 106.6428}', 'online', 4.0, NOW(), NOW()),

-- Quận 8
('HCM-Q8-001', 'Trạm sạc Ba Tơ', '{"address": "321 Ba Tơ, Quận 8, TP.HCM", "district": "Quận 8", "city": "Hồ Chí Minh", "latitude": 10.7269, "longitude": 106.6289}', 'online', 4.0, NOW(), NOW()),
('HCM-Q8-002', 'Trạm sạc Dương Bá Trạc', '{"address": "654 Dương Bá Trạc, Quận 8, TP.HCM", "district": "Quận 8", "city": "Hồ Chí Minh", "latitude": 10.7306, "longitude": 106.6322}', 'online', 4.1, NOW(), NOW()),

-- Quận 11
('HCM-Q11-001', 'Trạm sạc Lạc Long Quân', '{"address": "234 Lạc Long Quân, Quận 11, TP.HCM", "district": "Quận 11", "city": "Hồ Chí Minh", "latitude": 10.7647, "longitude": 106.6503}', 'online', 4.2, NOW(), NOW()),
('HCM-Q11-002', 'Trạm sạc Nguyễn Thị Nhỏ', '{"address": "567 Nguyễn Thị Nhỏ, Quận 11, TP.HCM", "district": "Quận 11", "city": "Hồ Chí Minh", "latitude": 10.7689, "longitude": 106.6536}', 'online', 4.1, NOW(), NOW()),

-- Quận Bình Tân
('HCM-BT2-001', 'Trạm sạc An Dương Vương', '{"address": "890 An Dương Vương, Quận Bình Tân, TP.HCM", "district": "Quận Bình Tân", "city": "Hồ Chí Minh", "latitude": 10.7369, "longitude": 106.6056}', 'online', 4.2, NOW(), NOW()),
('HCM-BT2-002', 'Trạm sạc Khu Công Nghiệp Tân Tạo', '{"address": "Khu Công Nghiệp Tân Tạo, Quận Bình Tân, TP.HCM", "district": "Quận Bình Tân", "city": "Hồ Chí Minh", "latitude": 10.7411, "longitude": 106.6094}', 'online', 4.3, NOW(), NOW()),

-- Huyện Bình Chánh
('HCM-BC-001', 'Trạm sạc Quốc Lộ 1A', '{"address": "Quốc Lộ 1A, Huyện Bình Chánh, TP.HCM", "district": "Bình Chánh", "city": "Hồ Chí Minh", "latitude": 10.6914, "longitude": 106.5872}', 'online', 4.1, NOW(), NOW()),
('HCM-BC-002', 'Trạm sạc Đa Phước', '{"address": "Đa Phước, Huyện Bình Chánh, TP.HCM", "district": "Bình Chánh", "city": "Hồ Chí Minh", "latitude": 10.6956, "longitude": 106.5911}', 'online', 4.0, NOW(), NOW()),

-- Huyện Củ Chi
('HCM-CC-001', 'Trạm sạc Trung Tâm Củ Chi', '{"address": "Trung Tâm Củ Chi, Huyện Củ Chi, TP.HCM", "district": "Củ Chi", "city": "Hồ Chí Minh", "latitude": 10.9733, "longitude": 106.4931}', 'online', 4.0, NOW(), NOW()),
('HCM-CC-002', 'Trạm sạc Tân Phú Trung', '{"address": "Tân Phú Trung, Huyện Củ Chi, TP.HCM", "district": "Củ Chi", "city": "Hồ Chí Minh", "latitude": 10.9789, "longitude": 106.4978}', 'online', 4.1, NOW(), NOW()),

-- Huyện Hóc Môn
('HCM-HM-001', 'Trạm sạc Hóc Môn', '{"address": "Trung Tâm Hóc Môn, Huyện Hóc Môn, TP.HCM", "district": "Hóc Môn", "city": "Hồ Chí Minh", "latitude": 10.8822, "longitude": 106.5889}', 'online', 4.1, NOW(), NOW()),
('HCM-HM-002', 'Trạm sạc Quốc Lộ 22', '{"address": "Quốc Lộ 22, Huyện Hóc Môn, TP.HCM", "district": "Hóc Môn", "city": "Hồ Chí Minh", "latitude": 10.8867, "longitude": 106.5933}', 'online', 4.0, NOW(), NOW()),

-- Huyện Nhà Bè
('HCM-NB-001', 'Trạm sạc Nhà Bè', '{"address": "Trung Tâm Nhà Bè, Huyện Nhà Bè, TP.HCM", "district": "Nhà Bè", "city": "Hồ Chí Minh", "latitude": 10.6872, "longitude": 106.7319}', 'online', 4.2, NOW(), NOW()),
('HCM-NB-002', 'Trạm sạc Phú Xuân', '{"address": "Phú Xuân, Huyện Nhà Bè, TP.HCM", "district": "Nhà Bè", "city": "Hồ Chí Minh", "latitude": 10.6917, "longitude": 106.7364}', 'online', 4.1, NOW(), NOW()),

-- Huyện Cần Giờ
('HCM-CG-001', 'Trạm sạc Cần Thạnh', '{"address": "Cần Thạnh, Huyện Cần Giờ, TP.HCM", "district": "Cần Giờ", "city": "Hồ Chí Minh", "latitude": 10.4114, "longitude": 106.9564}', 'online', 4.0, NOW(), NOW()),
('HCM-CG-002', 'Trạm sạc Đảo Thạnh An', '{"address": "Đảo Thạnh An, Huyện Cần Giờ, TP.HCM", "district": "Cần Giờ", "city": "Hồ Chí Minh", "latitude": 10.4167, "longitude": 106.9611}', 'online', 4.1, NOW(), NOW());

