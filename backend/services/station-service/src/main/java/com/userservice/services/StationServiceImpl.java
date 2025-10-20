// FILE: StationServiceImpl.java
package com.userservice.services;

import com.userservice.dtos.CreateStationRequestDto;
import com.userservice.dtos.StationResponseDto;
import com.userservice.dtos.UpdateStationRequestDto;
import com.userservice.entities.Station;
import com.userservice.repositories.StationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
// Tái sử dụng ResourceNotFoundException từ user-service hoặc tạo mới
// Giả sử bạn tạo mới nó trong package com.stationservice.exceptions
import com.paymentservice.exceptions.ResourceNotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StationServiceImpl implements StationService {

    private final StationRepository stationRepository;

    @Override
    public StationResponseDto createStation(CreateStationRequestDto requestDto) {
        Station station = new Station();
        station.setStationCode(requestDto.getStationCode());
        station.setStationName(requestDto.getStationName());
        station.setLocation(requestDto.getLocation());

        Station savedStation = stationRepository.save(station);
        return convertToDto(savedStation);
    }

    @Override
    public StationResponseDto getStationById(Long stationId) {
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found with id: " + stationId));
        return convertToDto(station);
    }

    @Override
    public List<StationResponseDto> getAllStations() {
        return stationRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public StationResponseDto updateStation(Long stationId, UpdateStationRequestDto requestDto) {
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found with id: " + stationId));

        station.setStationName(requestDto.getStationName());
        station.setLocation(requestDto.getLocation());
        station.setStatus(requestDto.getStatus());

        Station updatedStation = stationRepository.save(station);
        return convertToDto(updatedStation);
    }

    @Override
    public void deleteStation(Long stationId) {
        if (!stationRepository.existsById(stationId)) {
            throw new ResourceNotFoundException("Station not found with id: " + stationId);
        }
        stationRepository.deleteById(stationId);
    }

    private StationResponseDto convertToDto(Station station) {
        StationResponseDto dto = new StationResponseDto();
        dto.setStationId(station.getStationId());
        dto.setStationCode(station.getStationCode());
        dto.setStationName(station.getStationName());
        dto.setLocation(station.getLocation());
        dto.setStatus(station.getStatus());
        dto.setRating(station.getRating());
        dto.setCreatedAt(station.getCreatedAt());
        return dto;
    }
}