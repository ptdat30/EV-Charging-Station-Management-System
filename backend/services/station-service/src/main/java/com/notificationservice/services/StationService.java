// FILE: StationService.java
package com.notificationservice.services;

import com.notificationservice.dtos.CreateStationRequestDto;
import com.notificationservice.dtos.StationResponseDto;
import com.notificationservice.dtos.UpdateStationRequestDto;
import java.util.List;

public interface StationService {
    StationResponseDto createStation(CreateStationRequestDto requestDto);
    StationResponseDto getStationById(Long stationId);
    List<StationResponseDto> getAllStations();
    StationResponseDto updateStation(Long stationId, UpdateStationRequestDto requestDto);
    void deleteStation(Long stationId);
}