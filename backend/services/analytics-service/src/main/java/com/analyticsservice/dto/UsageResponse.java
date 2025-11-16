package com.analyticsservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsageResponse {
    private Long totalSessions;
    private BigDecimal totalEnergyKwh;
    private Long totalChargingMinutes;
    private Long uniqueUsers;
    private List<StationUsage> topStations;
    private UsageStats stats;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StationUsage {
        private Long stationId;
        private String stationName;
        private Long sessions;
        private BigDecimal energyKwh;
        private Long chargingMinutes;
        private BigDecimal revenue; // Total revenue for this station
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UsageStats {
        private BigDecimal avgSessionDurationMinutes;
        private BigDecimal avgEnergyPerSession;
        private BigDecimal utilizationRate; // sessions / capacity
    }
}

