// FILE: UpdateStationRequestDto.java
package com.stationservice.dtos;

import com.stationservice.entities.Station;
import lombok.Data;

@Data
public class UpdateStationRequestDto {
    private String stationName;
    private String location;
    private Station.StationStatus status;
}