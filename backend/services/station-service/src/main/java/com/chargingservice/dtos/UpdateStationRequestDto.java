// FILE: UpdateStationRequestDto.java
package com.chargingservice.dtos;

import com.chargingservice.entities.Station;
import lombok.Data;

@Data
public class UpdateStationRequestDto {
    private String stationName;
    private String location;
    private Station.StationStatus status;
}