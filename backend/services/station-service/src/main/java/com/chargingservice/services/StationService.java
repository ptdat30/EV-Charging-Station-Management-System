// FILE: StationService.java
package com.chargingservice.services;

import com.chargingservice.dtos.CreateStationRequestDto;
import com.chargingservice.dtos.StationResponseDto;
import com.chargingservice.dtos.UpdateStationRequestDto;
import java.util.List;

public interface StationService {
    StationResponseDto createStation(CreateStationRequestDto requestDto);
    StationResponseDto getStationById(Long stationId);
    List<StationResponseDto> getAllStations();
    StationResponseDto updateStation(Long stationId, UpdateStationRequestDto requestDto);
    void deleteStation(Long stationId);
}