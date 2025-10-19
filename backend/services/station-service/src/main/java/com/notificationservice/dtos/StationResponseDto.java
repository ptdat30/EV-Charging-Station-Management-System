// FILE: StationResponseDto.java
package com.notificationservice.dtos;

import com.notificationservice.entities.Station;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class StationResponseDto {
    private Long stationId;
    private String stationCode;
    private String stationName;
    private String location; // Tạm thời vẫn là String
    private Station.StationStatus status;
    private BigDecimal rating;
    private LocalDateTime createdAt;
}