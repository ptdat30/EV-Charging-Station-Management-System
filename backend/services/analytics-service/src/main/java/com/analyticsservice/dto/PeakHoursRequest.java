package com.analyticsservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PeakHoursRequest {
    private Long stationId; // null = all stations
    private String region; // null = all regions
    @NotNull(message = "From date is required")
    private LocalDateTime from;
    @NotNull(message = "To date is required")
    private LocalDateTime to;
}

