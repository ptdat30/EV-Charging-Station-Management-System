// FILE: UpdateStationRequestDto.java
package com.notificationservice.dtos;

import com.notificationservice.entities.Station;
import lombok.Data;

@Data
public class UpdateStationRequestDto {
    private String stationName;
    private String location;
    private Station.StationStatus status;
}