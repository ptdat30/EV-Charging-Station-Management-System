// ===============================================================
// FILE: ChargingServiceImpl.java (Phiên bản đã sửa lỗi)
// PACKAGE: com.chargingservice.services
// MỤC ĐÍCH: Triển khai logic bắt đầu phiên sạc và gọi sang station-service.
// ===============================================================
package com.chargingservice.services;

import com.chargingservice.clients.StationServiceClient;
import com.chargingservice.dtos.SessionResponseDto;
import com.chargingservice.dtos.StartSessionRequestDto;
import com.chargingservice.dtos.internal.UpdateChargerStatusDto;
import com.chargingservice.entities.ChargingSession;
import com.chargingservice.repositories.ChargingSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChargingServiceImpl implements ChargingService {

    private final ChargingSessionRepository sessionRepository;
    private final StationServiceClient stationServiceClient;

    @Override
    public SessionResponseDto startSession(StartSessionRequestDto requestDto) {
        ChargingSession session = new ChargingSession();
        session.setUserId(requestDto.getUserId());
        session.setStationId(requestDto.getStationId());
        session.setChargerId(requestDto.getChargerId());
        session.setSessionCode(UUID.randomUUID().toString());
        session.setStartTime(LocalDateTime.now());
        session.setSessionStatus(ChargingSession.SessionStatus.charging);

        ChargingSession savedSession = sessionRepository.save(session);

        // [COMMAND]: Gọi sang station-service để cập nhật trạng thái trụ sạc.
        try {
            UpdateChargerStatusDto statusDto = new UpdateChargerStatusDto();
            statusDto.setStatus(UpdateChargerStatusDto.ChargerStatus.in_use);
            stationServiceClient.updateChargerStatus(savedSession.getChargerId(), statusDto);
        } catch (Exception e) {
            // [COMMAND]: TO-DO: Xử lý lỗi nếu gọi service thất bại.
            // Ví dụ: Ghi log, hoặc chuyển phiên sạc sang trạng thái 'failed'.
            System.err.println("Failed to update charger status: " + e.getMessage());
        }

        return convertToDto(savedSession);
    }

    // [COMMAND]: Phương thức helper để chuyển đổi Entity sang DTO.
    private SessionResponseDto convertToDto(ChargingSession session) {
        SessionResponseDto dto = new SessionResponseDto();
        dto.setSessionId(session.getSessionId());
        dto.setUserId(session.getUserId());
        dto.setStationId(session.getStationId());
        dto.setChargerId(session.getChargerId());
        dto.setSessionCode(session.getSessionCode());
        dto.setStartTime(session.getStartTime());
        dto.setEndTime(session.getEndTime());
        dto.setEnergyConsumed(session.getEnergyConsumed());
        dto.setSessionStatus(session.getSessionStatus());
        dto.setCreatedAt(session.getCreatedAt());
        return dto;
    }
}