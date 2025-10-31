package com.stationservice.config;

import com.stationservice.entities.Charger;
import com.stationservice.entities.Station;
import com.stationservice.repositories.ChargerRepository;
import com.stationservice.repositories.StationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

/**
 * Data Seeder để tạo stations và chargers khi app khởi động
 * Chỉ chạy khi profile = "dev" hoặc "seed"
 * 
 * Để chạy: thêm vào application.yml:
 * spring.profiles.active: dev,seed
 */
@Slf4j
@Configuration
@Profile("seed")
@RequiredArgsConstructor
public class DataSeeder {

    private final StationRepository stationRepository;
    private final ChargerRepository chargerRepository;

    @Bean
    CommandLineRunner seedStations() {
        return args -> {
            if (stationRepository.count() > 0) {
                log.info("Database đã có dữ liệu, bỏ qua seed.");
                return;
            }

            log.info("🚀 Bắt đầu seed dữ liệu stations và chargers...");

            List<Station> stations = createStations();
            log.info("✅ Đã tạo {} stations", stations.size());

            // Tạo chargers cho mỗi station
            for (Station station : stations) {
                createChargersForStation(station);
            }

            log.info("✅ Hoàn tất seed dữ liệu!");
        };
    }

    private List<Station> createStations() {
        List<Station> stations = Arrays.asList(
            createStation("HCM-Q1-001", "Trạm sạc VinFast Quận 1 - Nguyễn Huệ", 
                "{\"address\": \"123 Nguyễn Huệ, Quận 1, TP.HCM\", \"district\": \"Quận 1\", \"city\": \"Hồ Chí Minh\", \"latitude\": 10.7769, \"longitude\": 106.7009}", 4.5),
            createStation("HCM-Q1-002", "Trạm sạc Đồng Khởi", 
                "{\"address\": \"45 Đồng Khởi, Quận 1, TP.HCM\", \"district\": \"Quận 1\", \"city\": \"Hồ Chí Minh\", \"latitude\": 10.7794, \"longitude\": 106.6994}", 4.3),
            createStation("HCM-Q3-001", "Trạm sạc Lê Văn Sỹ", 
                "{\"address\": \"234 Lê Văn Sỹ, Quận 3, TP.HCM\", \"district\": \"Quận 3\", \"city\": \"Hồ Chí Minh\", \"latitude\": 10.7908, \"longitude\": 106.6876}", 4.2),
            createStation("HCM-Q7-001", "Trạm sạc Phú Mỹ Hưng", 
                "{\"address\": \"Nguyễn Đức Cảnh, Phú Mỹ Hưng, Quận 7, TP.HCM\", \"district\": \"Quận 7\", \"city\": \"Hồ Chí Minh\", \"latitude\": 10.7314, \"longitude\": 106.7179}", 4.6),
            createStation("HCM-Q7-002", "Trạm sạc Crescent Mall", 
                "{\"address\": \"101 Tôn Dật Tiên, Phú Mỹ Hưng, Quận 7, TP.HCM\", \"district\": \"Quận 7\", \"city\": \"Hồ Chí Minh\", \"latitude\": 10.7297, \"longitude\": 106.7192}", 4.5),
            createStation("HCM-BT-001", "Trạm sạc Xô Viết Nghệ Tĩnh", 
                "{\"address\": \"567 Xô Viết Nghệ Tĩnh, Quận Bình Thạnh, TP.HCM\", \"district\": \"Quận Bình Thạnh\", \"city\": \"Hồ Chí Minh\", \"latitude\": 10.8014, \"longitude\": 106.7143}", 4.3),
            createStation("HCM-TB-002", "Trạm sạc Sân Bay Tân Sơn Nhất", 
                "{\"address\": \"Trường Sơn, Quận Tân Bình, TP.HCM\", \"district\": \"Quận Tân Bình\", \"city\": \"Hồ Chí Minh\", \"latitude\": 10.8188, \"longitude\": 106.6520}", 4.6),
            createStation("HCM-TD-002", "Trạm sạc Đại Học Quốc Gia", 
                "{\"address\": \"Đại Học Quốc Gia, Thủ Đức, TP.HCM\", \"district\": \"Thủ Đức\", \"city\": \"Hồ Chí Minh\", \"latitude\": 10.8700, \"longitude\": 106.8031}", 4.6),
            createStation("HCM-PN-001", "Trạm sạc Phan Xích Long", 
                "{\"address\": \"123 Phan Xích Long, Quận Phú Nhuận, TP.HCM\", \"district\": \"Quận Phú Nhuận\", \"city\": \"Hồ Chí Minh\", \"latitude\": 10.8007, \"longitude\": 106.6860}", 4.5),
            createStation("HCM-Q12-001", "Trạm sạc Tân Hưng Thuận", 
                "{\"address\": \"123 Tân Hưng Thuận, Quận 12, TP.HCM\", \"district\": \"Quận 12\", \"city\": \"Hồ Chí Minh\", \"latitude\": 10.8633, \"longitude\": 106.6300}", 4.2)
        );

        return stationRepository.saveAll(stations);
    }

    private Station createStation(String code, String name, String location, double rating) {
        Station station = new Station();
        station.setStationCode(code);
        station.setStationName(name);
        station.setLocation(location);
        station.setStatus(Station.StationStatus.online);
        station.setRating(BigDecimal.valueOf(rating));
        return station;
    }

    private void createChargersForStation(Station station) {
        // Seed dựa trên station code để consistent (không phụ thuộc vào ID)
        Random random = new Random(station.getStationCode().hashCode());
        
        // Mỗi station có 3-5 chargers (ngẫu nhiên nhưng consistent)
        int chargerCount = 3 + random.nextInt(3); // 3, 4, hoặc 5
        
        List<Charger> chargers = new ArrayList<>();
        List<ChargerConfig> chargerConfigs = Arrays.asList(
            new ChargerConfig(Charger.ChargerType.CCS, BigDecimal.valueOf(50.00)),
            new ChargerConfig(Charger.ChargerType.AC_Type2, BigDecimal.valueOf(22.00)),
            new ChargerConfig(Charger.ChargerType.CCS, BigDecimal.valueOf(75.00)),
            new ChargerConfig(Charger.ChargerType.CHAdeMO, BigDecimal.valueOf(50.00)),
            new ChargerConfig(Charger.ChargerType.CCS, BigDecimal.valueOf(100.00)),
            new ChargerConfig(Charger.ChargerType.AC_Type2, BigDecimal.valueOf(11.00)),
            new ChargerConfig(Charger.ChargerType.CCS, BigDecimal.valueOf(150.00))
        );
        
        // Chọn ngẫu nhiên chargerCount chargers từ danh sách
        for (int i = 0; i < chargerCount; i++) {
            ChargerConfig config = chargerConfigs.get(random.nextInt(chargerConfigs.size()));
            String chargerCode = station.getStationCode() + "-CHG-" + String.format("%03d", (i + 1));
            chargers.add(createCharger(station, chargerCode, config.type, config.power));
        }

        chargerRepository.saveAll(chargers);
        log.info("✅ Đã tạo {} chargers cho station {}", chargers.size(), station.getStationName());
    }
    
    // Helper class để lưu config charger
    private static class ChargerConfig {
        final Charger.ChargerType type;
        final BigDecimal power;
        
        ChargerConfig(Charger.ChargerType type, BigDecimal power) {
            this.type = type;
            this.power = power;
        }
    }

    private Charger createCharger(Station station, String code, Charger.ChargerType type, BigDecimal power) {
        Charger charger = new Charger();
        charger.setStation(station);
        charger.setChargerCode(code);
        charger.setChargerType(type);
        charger.setPowerRating(power);
        charger.setStatus(Charger.ChargerStatus.available);
        return charger;
    }
}

