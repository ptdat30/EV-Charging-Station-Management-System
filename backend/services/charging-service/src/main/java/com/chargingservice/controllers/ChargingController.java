// ===============================================================
// FILE: ChargingController.java (Phiên bản hoàn thiện)
// PACKAGE: com.chargingservice.controllers
// ===============================================================
package com.chargingservice.controllers;

import com.chargingservice.dtos.SessionResponseDto;
import com.chargingservice.dtos.StartSessionRequestDto;
import com.chargingservice.services.ChargingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class ChargingController {

    private final ChargingService chargingService;

    // [COMMAND]: POST /api/sessions/start
    @PostMapping("/start")
    public ResponseEntity<SessionResponseDto> startChargingSession(@RequestBody StartSessionRequestDto requestDto) {
        SessionResponseDto newSession = chargingService.startSession(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newSession);
    }

    // [COMMAND]: POST /api/sessions/{id}/stop
    @PostMapping("/{id}/stop")
    public ResponseEntity<SessionResponseDto> stopChargingSession(@PathVariable Long id) {
        SessionResponseDto stoppedSession = chargingService.stopSession(id);
        return ResponseEntity.ok(stoppedSession);
    }

    // [COMMAND]: POST /api/sessions/{id}/cancel
    @PostMapping("/{id}/cancel")
    public ResponseEntity<SessionResponseDto> cancelChargingSession(@PathVariable Long id) {
        SessionResponseDto cancelledSession = chargingService.cancelSession(id);
        return ResponseEntity.ok(cancelledSession);
    }

    // [COMMAND]: GET /api/sessions/{id}
    @GetMapping("/{id}")
    public ResponseEntity<SessionResponseDto> getSessionById(@PathVariable Long id) {
        return ResponseEntity.ok(chargingService.getSessionById(id));
    }

    // [COMMAND]: GET /api/sessions
    @GetMapping
    public ResponseEntity<List<SessionResponseDto>> getAllSessions() {
        return ResponseEntity.ok(chargingService.getAllSessions());
    }
}