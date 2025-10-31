package com.chargingservice.controllers;

import com.chargingservice.dtos.CreateReservationRequestDto;
import com.chargingservice.dtos.ReservationResponseDto;
import com.chargingservice.services.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<ReservationResponseDto> createReservation(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody CreateReservationRequestDto requestDto) {
        // Log request để debug
        org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ReservationController.class);
        log.info("Received reservation request - userId: {}, stationId: {}, chargerId: {}, startTime: {}, endTime: {}, duration: {}", 
                userId, requestDto.getStationId(), requestDto.getChargerId(), 
                requestDto.getReservedStartTime(), requestDto.getReservedEndTime(), requestDto.getDurationMinutes());
        
        requestDto.setUserId(userId);
        ReservationResponseDto reservation = reservationService.createReservation(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
    }

    @GetMapping("/me")
    public ResponseEntity<List<ReservationResponseDto>> getMyReservations(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(reservationService.getReservationsByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponseDto> getReservationById(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.getReservationById(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ReservationResponseDto> cancelReservation(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(reservationService.cancelReservation(id, userId, reason));
    }

    @PostMapping("/{id}/check-in")
    public ResponseEntity<ReservationResponseDto> checkIn(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {
        ReservationResponseDto reservation = reservationService.checkIn(id, userId);
        return ResponseEntity.ok(reservation);
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<?> startSessionFromReservation(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(reservationService.startSessionFromReservation(id, userId));
    }
    
    /**
     * Start session from QR code scan
     * POST /api/reservations/qr/start
     */
    @PostMapping("/qr/start")
    public ResponseEntity<com.chargingservice.dtos.SessionResponseDto> startSessionFromQRCode(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam String qrCode) {
        com.chargingservice.dtos.SessionResponseDto session = reservationService.startSessionFromQRCode(qrCode, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(session);
    }
}

