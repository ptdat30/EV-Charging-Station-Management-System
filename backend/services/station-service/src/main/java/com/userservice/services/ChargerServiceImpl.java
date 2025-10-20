// FILE: ChargerServiceImpl.java
package com.userservice.services;

import com.userservice.dtos.ChargerResponseDto;
import com.userservice.dtos.CreateChargerRequestDto;
import com.userservice.dtos.UpdateChargerRequestDto;
import com.userservice.entities.Charger;
import com.userservice.entities.Station;
import com.paymentservice.exceptions.ResourceNotFoundException;
import com.userservice.repositories.ChargerRepository;
import com.userservice.repositories.StationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChargerServiceImpl implements ChargerService {

    private final ChargerRepository chargerRepository;
    private final StationRepository stationRepository;

    @Override
    public ChargerResponseDto addChargerToStation(Long stationId, CreateChargerRequestDto requestDto) {
        // Tìm trạm cha, nếu không có sẽ báo lỗi
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found with id: " + stationId));

        Charger charger = new Charger();
        charger.setStation(station); // Gán trạm cha cho trụ sạc
        charger.setChargerCode(requestDto.getChargerCode());
        charger.setChargerType(requestDto.getChargerType());
        charger.setPowerRating(requestDto.getPowerRating());

        Charger savedCharger = chargerRepository.save(charger);
        return convertToDto(savedCharger);
    }

    @Override
    public ChargerResponseDto getChargerById(Long chargerId) {
        Charger charger = chargerRepository.findById(chargerId)
                .orElseThrow(() -> new ResourceNotFoundException("Charger not found with id: " + chargerId));
        return convertToDto(charger);
    }

    @Override
    public List<ChargerResponseDto> getChargersByStationId(Long stationId) {
        // Kiểm tra trạm có tồn tại không
        if (!stationRepository.existsById(stationId)) {
            throw new ResourceNotFoundException("Station not found with id: " + stationId);
        }

        // Tạo một phương thức mới trong ChargerRepository để tìm theo stationId
        return chargerRepository.findByStationStationId(stationId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ChargerResponseDto updateChargerStatus(Long chargerId, UpdateChargerRequestDto requestDto) {
        Charger charger = chargerRepository.findById(chargerId)
                .orElseThrow(() -> new ResourceNotFoundException("Charger not found with id: " + chargerId));

        charger.setStatus(requestDto.getStatus());
        Charger updatedCharger = chargerRepository.save(charger);
        return convertToDto(updatedCharger);
    }

    @Override
    public void deleteCharger(Long chargerId) {
        if (!chargerRepository.existsById(chargerId)) {
            throw new ResourceNotFoundException("Charger not found with id: " + chargerId);
        }
        chargerRepository.deleteById(chargerId);
    }

    private ChargerResponseDto convertToDto(Charger charger) {
        ChargerResponseDto dto = new ChargerResponseDto();
        dto.setChargerId(charger.getChargerId());
        dto.setStationId(charger.getStation().getStationId());
        dto.setChargerCode(charger.getChargerCode());
        dto.setChargerType(charger.getChargerType());
        dto.setPowerRating(charger.getPowerRating());
        dto.setStatus(charger.getStatus());
        dto.setCreatedAt(charger.getCreatedAt());
        return dto;
    }
}