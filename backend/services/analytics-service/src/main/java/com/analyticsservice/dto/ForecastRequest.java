package com.analyticsservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ForecastRequest {
    private Long stationId; // null = all stations
    private String region; // null = all regions
    @NotNull(message = "Horizon months is required")
    private Integer horizonMonths; // 3, 6, 12
}

