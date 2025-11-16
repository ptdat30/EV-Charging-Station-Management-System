package com.analyticsservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PeakHoursResponse {
    private List<HourlyData> hourlyData; // 24 hours
    private List<PeakHour> topPeakHours; // Top 3-5 hours

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HourlyData {
        private Integer hour; // 0-23
        private String hourLabel; // "00:00", "01:00", etc.
        private Long sessions;
        private Double percentage; // % of total sessions
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PeakHour {
        private Integer hour;
        private String hourLabel;
        private Long sessions;
        private Double percentage;
    }
}

