// FILE: StationService.java
package com.userservice.services;

import com.userservice.dtos.CreateStationRequestDto;
import com.userservice.dtos.StationResponseDto;
import com.userservice.dtos.UpdateStationRequestDto;
import java.util.List;

public interface StationService {
    StationResponseDto createStation(CreateStationRequestDto requestDto);
    StationResponseDto getStationById(Long stationId);
    List<StationResponseDto> getAllStations();
    StationResponseDto updateStation(Long stationId, UpdateStationRequestDto requestDto);
    void deleteStation(Long stationId);
}