// FILE: StationController.java
package com.stationservice.controllers;

import com.stationservice.dtos.CreateStationRequestDto;
import com.stationservice.dtos.StationResponseDto;
import com.stationservice.dtos.UpdateStationRequestDto;
import com.stationservice.services.StationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
public class StationController {

    private final StationService stationService;

    @PostMapping
    public ResponseEntity<StationResponseDto> createStation(@RequestBody CreateStationRequestDto requestDto) {
        StationResponseDto createdStation = stationService.createStation(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdStation);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StationResponseDto> getStationById(@PathVariable Long id) {
        return ResponseEntity.ok(stationService.getStationById(id));
    }

    @GetMapping("/getall")
    public ResponseEntity<List<StationResponseDto>> getAllStations() {
        return ResponseEntity.ok(stationService.getAllStations());
    }

    @GetMapping("/search")
    public ResponseEntity<List<StationResponseDto>> searchStations(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) Double maxDistance,
            @RequestParam(required = false) String chargerType,
            @RequestParam(required = false) Double minPower,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sortBy
    ) {
        return ResponseEntity.ok(stationService.searchStations(city, latitude, longitude, maxDistance, chargerType, minPower, status, sortBy));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StationResponseDto> updateStation(@PathVariable Long id, @RequestBody UpdateStationRequestDto requestDto) {
        return ResponseEntity.ok(stationService.updateStation(id, requestDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStation(@PathVariable Long id) {
        stationService.deleteStation(id);
        return ResponseEntity.noContent().build();
    }
}