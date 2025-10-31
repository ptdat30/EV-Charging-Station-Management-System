-- Script tạo chargers cho các stations
-- Mỗi station sẽ có 3-5 chargers ngẫu nhiên với các loại khác nhau

-- Xóa chargers cũ (nếu cần)
-- DELETE FROM chargers;

-- Tạo stored procedure để tạo chargers ngẫu nhiên cho mỗi station
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS CreateChargersForStations()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_station_id BIGINT;
    DECLARE v_station_code VARCHAR(50);
    DECLARE v_charger_count INT;
    DECLARE v_counter INT;
    DECLARE v_charger_code VARCHAR(100);
    DECLARE v_charger_type VARCHAR(20);
    DECLARE v_power_rating DECIMAL(10,2);
    DECLARE station_cursor CURSOR FOR SELECT station_id, station_code FROM stations;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN station_cursor;
    
    station_loop: LOOP
        FETCH station_cursor INTO v_station_id, v_station_code;
        IF done THEN
            LEAVE station_loop;
        END IF;
        
        -- Tạo 3-5 chargers ngẫu nhiên cho mỗi station (sử dụng station_id làm seed)
        SET v_charger_count = 3 + (v_station_id % 3); -- 3, 4, hoặc 5 chargers
        SET v_counter = 1;
        
        WHILE v_counter <= v_charger_count DO
            -- Chọn loại charger và power rating ngẫu nhiên
            SET v_charger_code = CONCAT(v_station_code, '-CHG-', LPAD(v_counter, 3, '0'));
            
            -- Phân bổ charger types dựa trên modulo của counter và station_id
            CASE ((v_station_id + v_counter) % 7)
                WHEN 0 THEN SET v_charger_type = 'CCS', v_power_rating = 50.00;
                WHEN 1 THEN SET v_charger_type = 'AC_Type2', v_power_rating = 22.00;
                WHEN 2 THEN SET v_charger_type = 'CCS', v_power_rating = 75.00;
                WHEN 3 THEN SET v_charger_type = 'CHAdeMO', v_power_rating = 50.00;
                WHEN 4 THEN SET v_charger_type = 'CCS', v_power_rating = 100.00;
                WHEN 5 THEN SET v_charger_type = 'AC_Type2', v_power_rating = 11.00;
                ELSE SET v_charger_type = 'CCS', v_power_rating = 150.00;
            END CASE;
            
            INSERT INTO chargers (station_id, charger_code, charger_type, power_rating, status, created_at) 
            VALUES (v_station_id, v_charger_code, v_charger_type, v_power_rating, 'available', NOW());
            
            SET v_counter = v_counter + 1;
        END WHILE;
        
    END LOOP;
    
    CLOSE station_cursor;
END$$

DELIMITER ;

-- Gọi procedure để tạo chargers
CALL CreateChargersForStations();

-- Xóa procedure sau khi dùng
DROP PROCEDURE IF EXISTS CreateChargersForStations;
