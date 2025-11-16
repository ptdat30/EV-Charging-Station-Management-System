package com.analyticsservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForecastResponse {
    private List<ForecastDataPoint> forecastData;
    private List<InfrastructureSuggestion> suggestions;
    private ForecastSummary summary;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForecastDataPoint {
        private String month; // "2025-04", "2025-05", etc.
        private Long predictedSessions;
        private BigDecimal predictedRevenue;
        private BigDecimal predictedEnergyKwh;
        private Double confidenceLevel; // 0.0 - 1.0
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InfrastructureSuggestion {
        private String type; // "UPGRADE_STATION", "ADD_STATION", "INCREASE_CAPACITY"
        private String stationId; // null if region-level
        private String region; // null if station-level
        private String message;
        private String priority; // "HIGH", "MEDIUM", "LOW"
        private String reason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForecastSummary {
        private BigDecimal avgPredictedSessionsPerMonth;
        private BigDecimal avgPredictedRevenuePerMonth;
        private Double growthRatePercent; // vs current period
    }
}

