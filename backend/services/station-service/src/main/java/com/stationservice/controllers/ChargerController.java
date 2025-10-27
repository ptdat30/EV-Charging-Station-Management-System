// FILE: ChargerController.java
package com.stationservice.controllers;

import com.stationservice.dtos.ChargerResponseDto;
import com.stationservice.dtos.CreateChargerRequestDto;
import com.stationservice.dtos.UpdateChargerRequestDto;
import com.stationservice.services.ChargerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api") // Đường dẫn gốc
@RequiredArgsConstructor
public class ChargerController {

    private final ChargerService chargerService;

    // Thêm một trụ sạc vào trạm
    @PostMapping("/stations/{stationId}/chargers")
    public ResponseEntity<ChargerResponseDto> addCharger(
            @PathVariable Long stationId,
            @RequestBody CreateChargerRequestDto requestDto) {
        ChargerResponseDto newCharger = chargerService.addChargerToStation(stationId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newCharger);
    }

    // Lấy tất cả trụ sạc của một trạm
    @GetMapping("/stations/{stationId}/chargers")
    public ResponseEntity<List<ChargerResponseDto>> getChargersByStation(@PathVariable Long stationId) {
        return ResponseEntity.ok(chargerService.getChargersByStationId(stationId));
    }

    // Lấy thông tin một trụ sạc cụ thể
    @GetMapping("/chargers/{chargerId}")
    public ResponseEntity<ChargerResponseDto> getChargerById(@PathVariable Long chargerId) {
        return ResponseEntity.ok(chargerService.getChargerById(chargerId));
    }

    // Cập nhật trạng thái trụ sạc
    @PutMapping("/chargers/{chargerId}")
    public ResponseEntity<ChargerResponseDto> updateChargerStatus(
            @PathVariable Long chargerId,
            @RequestBody UpdateChargerRequestDto requestDto) {
        return ResponseEntity.ok(chargerService.updateChargerStatus(chargerId, requestDto));
    }

    // Xóa một trụ sạc
    @DeleteMapping("/chargers/{chargerId}")
    public ResponseEntity<Void> deleteCharger(@PathVariable Long chargerId) {
        chargerService.deleteCharger(chargerId);
        return ResponseEntity.noContent().build();
    }
}