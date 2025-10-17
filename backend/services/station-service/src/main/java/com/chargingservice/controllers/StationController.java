// FILE: StationController.java
package com.chargingservice.controllers;

import com.chargingservice.dtos.CreateStationRequestDto;
import com.chargingservice.dtos.StationResponseDto;
import com.chargingservice.dtos.UpdateStationRequestDto;
import com.chargingservice.services.StationService;
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