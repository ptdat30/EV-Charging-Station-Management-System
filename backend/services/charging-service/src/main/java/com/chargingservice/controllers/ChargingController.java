// FILE: ChargingController.java
package com.chargingservice.controllers;

import com.chargingservice.dtos.SessionResponseDto;
import com.chargingservice.dtos.StartSessionRequestDto;
import com.chargingservice.services.ChargingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class ChargingController {

    private final ChargingService chargingService;

    // [COMMAND]: Endpoint để bắt đầu một phiên sạc mới.
    @PostMapping("/start")
    public ResponseEntity<SessionResponseDto> startChargingSession(@RequestBody StartSessionRequestDto requestDto) {
        SessionResponseDto newSession = chargingService.startSession(requestDto);
        // [COMMAND]: Trả về status 201 Created cùng với thông tin của phiên sạc.
        return ResponseEntity.status(HttpStatus.CREATED).body(newSession);
    }
}