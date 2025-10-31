package com.chargingservice.controllers;

import com.chargingservice.dtos.SessionResponseDto;
import com.chargingservice.entities.ChargingSession;
import com.chargingservice.repositories.ChargingSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final ChargingSessionRepository sessionRepository;

    @GetMapping("/history")
    public ResponseEntity<List<SessionResponseDto>> getMyHistory(@RequestHeader("X-User-Id") Long userId) {
        List<ChargingSession> sessions = sessionRepository.findByUserIdOrderByStartTimeDesc(userId);
        List<SessionResponseDto> result = sessions.stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    private SessionResponseDto toDto(ChargingSession s) {
        SessionResponseDto dto = new SessionResponseDto();
        dto.setSessionId(s.getSessionId());
        dto.setUserId(s.getUserId());
        dto.setStationId(s.getStationId());
        dto.setChargerId(s.getChargerId());
        dto.setSessionCode(s.getSessionCode());
        dto.setStartTime(s.getStartTime());
        dto.setEndTime(s.getEndTime());
        dto.setEnergyConsumed(s.getEnergyConsumed());
        dto.setSessionStatus(s.getSessionStatus());
        dto.setCreatedAt(s.getCreatedAt());
        return dto;
    }
}


