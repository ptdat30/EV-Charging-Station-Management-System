package com.chargingservice.dtos;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class RouteBookingRequestDto {
    private List<RouteBookingItemDto> bookings;
    
    @Data
    public static class RouteBookingItemDto {
        private Integer order; // Order in the route (1, 2, 3, ...)
        private Long stationId;
        private Long chargerId; // Optional - can be null for any available charger
        
        // ISO-8601 format supported: "2025-10-31T09:00:00" hoặc "2025-10-31T09:00:00.000" hoặc "2025-10-31T09:00:00Z"
        // Parsed by JacksonConfig with custom LocalDateTimeDeserializer
        private LocalDateTime reservedStartTime;
        
        private LocalDateTime reservedEndTime;
        
        private Integer durationMinutes;
    }
}

