// FILE: StationService.java
package com.stationservice.services;

import com.stationservice.dtos.CreateStationRequestDto;
import com.stationservice.dtos.StationResponseDto;
import com.stationservice.dtos.UpdateStationRequestDto;
import java.util.List;

public interface StationService {
    StationResponseDto createStation(CreateStationRequestDto requestDto);
    StationResponseDto getStationById(Long stationId);
    List<StationResponseDto> getAllStations();
    List<StationResponseDto> searchStations(String city, Double latitude, Double longitude, Double maxDistance, String chargerType, Double minPower, String status, String sortBy);
    StationResponseDto updateStation(Long stationId, UpdateStationRequestDto requestDto);
    void deleteStation(Long stationId);
}