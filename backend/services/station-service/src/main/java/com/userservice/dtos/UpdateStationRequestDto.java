// FILE: UpdateStationRequestDto.java
package com.userservice.dtos;

import com.userservice.entities.Station;
import lombok.Data;

@Data
public class UpdateStationRequestDto {
    private String stationName;
    private String location;
    private Station.StationStatus status;
}