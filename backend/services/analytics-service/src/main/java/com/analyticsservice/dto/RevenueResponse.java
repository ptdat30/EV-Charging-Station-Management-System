package com.analyticsservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevenueResponse {
    private List<RevenueDataPoint> dataPoints;
    private BigDecimal totalRevenue;
    private Long totalSessions;
    private BigDecimal totalEnergyKwh;
    private SummaryStats summary;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueDataPoint {
        private String timeLabel; // "2025-01-15", "10:00", etc.
        private BigDecimal revenue;
        private Long sessions;
        private BigDecimal energyKwh;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryStats {
        private BigDecimal avgRevenuePerSession;
        private BigDecimal avgEnergyPerSession;
        private BigDecimal revenueGrowthPercent; // vs previous period
    }
}

