// FILE: StationServiceImpl.java
package com.stationservice.services;

import com.stationservice.dtos.CreateStationRequestDto;
import com.stationservice.dtos.StationResponseDto;
import com.stationservice.dtos.UpdateStationRequestDto;
import com.stationservice.entities.Charger;
import com.stationservice.entities.Station;
import com.stationservice.repositories.ChargerRepository;
import com.stationservice.repositories.StationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.stationservice.exceptions.ResourceNotFoundException;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StationServiceImpl implements StationService {

    private final StationRepository stationRepository;
    private final ChargerRepository chargerRepository;

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
    public List<StationResponseDto> searchStations(String city, Double latitude, Double longitude, Double maxDistance, String chargerType, Double minPower, String status, String sortBy) {
        // Load all stations first; apply station-level filters
        List<Station> stations = stationRepository.findAll();

        if (status != null && !status.isEmpty()) {
            try {
                Station.StationStatus statusEnum = Station.StationStatus.valueOf(status);
                stations = stations.stream()
                        .filter(s -> s.getStatus() == statusEnum)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException ignored) {}
        }

        // Charger-level filters: type, minPower, charger status
        boolean hasChargerFilter = (chargerType != null && !chargerType.isEmpty())
                || (minPower != null)
                || (status != null && (status.equalsIgnoreCase("in_use") || status.equalsIgnoreCase("available") || status.equalsIgnoreCase("offline") || status.equalsIgnoreCase("maintenance") || status.equalsIgnoreCase("reserved")));

        if (hasChargerFilter && !stations.isEmpty()) {
            Set<Long> stationIds = stations.stream().map(Station::getStationId).collect(Collectors.toSet());
            List<Charger> chargers = chargerRepository.findByStationStationIdIn(stationIds);

            if (chargerType != null && !chargerType.isEmpty()) {
                try {
                    Charger.ChargerType typeEnum = Charger.ChargerType.valueOf(chargerType);
                    chargers = chargers.stream().filter(c -> c.getChargerType() == typeEnum).collect(Collectors.toList());
                } catch (IllegalArgumentException ignored) {}
            }
            if (minPower != null) {
                BigDecimal min = BigDecimal.valueOf(minPower);
                chargers = chargers.stream().filter(c -> c.getPowerRating() != null && c.getPowerRating().compareTo(min) >= 0).collect(Collectors.toList());
            }
            if (status != null) {
                // interpret status also as charger status if matches
                try {
                    Charger.ChargerStatus chargerStatus = Charger.ChargerStatus.valueOf(status);
                    chargers = chargers.stream().filter(c -> c.getStatus() == chargerStatus).collect(Collectors.toList());
                } catch (IllegalArgumentException ignored) {}
            }

            Set<Long> matchedStationIds = chargers.stream().map(c -> c.getStation().getStationId()).collect(Collectors.toSet());
            stations = stations.stream().filter(s -> matchedStationIds.contains(s.getStationId())).collect(Collectors.toList());
        }

        // TODO: location filtering (city/lat/lng) when Station stores structured coordinates/city

        List<StationResponseDto> result = stations.stream().map(this::convertToDto).collect(Collectors.toList());

        if (sortBy != null && !sortBy.isEmpty()) {
            switch (sortBy) {
                case "rating":
                    result = result.stream().sorted(Comparator.comparing(StationResponseDto::getRating, Comparator.nullsLast(Comparator.naturalOrder())).reversed()).collect(Collectors.toList());
                    break;
                case "name":
                    result = result.stream().sorted(Comparator.comparing(StationResponseDto::getStationName, Comparator.nullsLast(Comparator.naturalOrder()))).collect(Collectors.toList());
                    break;
                default:
                    break;
            }
        }
        return result;
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