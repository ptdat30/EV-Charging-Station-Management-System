// ===============================================================
// FILE: ChargingServiceImpl.java (Phiên bản tích hợp payment)
// PACKAGE: com.chargingservice.services
// ===============================================================
package com.chargingservice.services;

import com.chargingservice.clients.PaymentServiceClient; // Import Payment client
import com.chargingservice.clients.StationServiceClient;
import com.chargingservice.dtos.SessionResponseDto;
import com.chargingservice.dtos.StartSessionRequestDto;
import com.chargingservice.dtos.internal.PaymentResponseDto; // Import DTO payment response
import com.chargingservice.dtos.internal.ProcessPaymentRequestDto; // Import DTO payment request
import com.chargingservice.dtos.internal.UpdateChargerStatusDto;
import com.chargingservice.entities.ChargingSession;
import com.chargingservice.exceptions.ResourceNotFoundException;
import com.chargingservice.repositories.ChargingSessionRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger; // Import Logger
import org.slf4j.LoggerFactory; // Import LoggerFactory
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChargingServiceImpl implements ChargingService {

    // [COMMAND]: Thêm Logger để ghi log tốt hơn
    private static final Logger log = LoggerFactory.getLogger(ChargingServiceImpl.class);

    private final ChargingSessionRepository sessionRepository;
    private final StationServiceClient stationServiceClient;
    private final PaymentServiceClient paymentServiceClient; // [COMMAND]: Tiêm PaymentServiceClient

    // --- CREATE ---
    @Override
    public SessionResponseDto startSession(StartSessionRequestDto requestDto) {
        log.info("Starting new charging session for user {} at charger {}", requestDto.getUserId(), requestDto.getChargerId());
        ChargingSession session = new ChargingSession();
        session.setUserId(requestDto.getUserId());
        session.setStationId(requestDto.getStationId());
        session.setChargerId(requestDto.getChargerId());
        session.setSessionCode(UUID.randomUUID().toString());
        session.setStartTime(LocalDateTime.now());
        session.setSessionStatus(ChargingSession.SessionStatus.charging);

        ChargingSession savedSession = sessionRepository.save(session);
        log.info("Session {} created successfully", savedSession.getSessionId());

        // Gọi sang station-service để cập nhật trụ sạc thành "in_use"
        updateChargerStatus(savedSession.getChargerId(), UpdateChargerStatusDto.ChargerStatus.in_use);

        return convertToDto(savedSession);
    }

    // --- UPDATE (STOP) ---
    @Override
    public SessionResponseDto stopSession(Long sessionId) {
        log.info("Attempting to stop session {}", sessionId);
        ChargingSession session = findSessionById(sessionId);

        // Chỉ dừng nếu đang sạc
        if (session.getSessionStatus() != ChargingSession.SessionStatus.charging) {
            log.warn("Session {} cannot be stopped in its current state: {}", sessionId, session.getSessionStatus());
            throw new IllegalStateException("Session cannot be stopped in its current state: " + session.getSessionStatus());
        }

        session.setEndTime(LocalDateTime.now());
        session.setSessionStatus(ChargingSession.SessionStatus.completed);

        // Giả lập tính toán năng lượng tiêu thụ (ví dụ: 0.01 kWh/giây)
        long durationInSeconds = Duration.between(session.getStartTime(), session.getEndTime()).getSeconds();
        // Xử lý trường hợp thời gian sạc quá ngắn (ví dụ < 1 giây) để tránh energy = 0
        if (durationInSeconds <= 0) {
            durationInSeconds = 1; // Tính ít nhất 1 giây
        }
        double energy = durationInSeconds * 0.01;
        session.setEnergyConsumed(BigDecimal.valueOf(energy).setScale(2, BigDecimal.ROUND_HALF_UP)); // Làm tròn 2 chữ số

        ChargingSession savedSession = sessionRepository.save(session);
        log.info("Session {} stopped. Energy consumed: {} kWh", savedSession.getSessionId(), savedSession.getEnergyConsumed());

        // [COMMAND]: Bước 1: Gọi sang station-service để cập nhật trụ sạc thành "available"
        updateChargerStatus(savedSession.getChargerId(), UpdateChargerStatusDto.ChargerStatus.available);

        // [COMMAND]: Bước 2: Gọi sang payment-service để xử lý thanh toán
        try {
            log.info("Processing payment for session {}", savedSession.getSessionId());
            ProcessPaymentRequestDto paymentDto = new ProcessPaymentRequestDto(
                    savedSession.getSessionId(),
                    savedSession.getUserId(),
                    savedSession.getEnergyConsumed(),
                    new BigDecimal("3000.00") // Đơn giá tạm thời
            );
            PaymentResponseDto paymentResult = paymentServiceClient.processPayment(paymentDto);
            log.info("Payment processed for session {}: Status - {}", savedSession.getSessionId(), paymentResult.getPaymentStatus());
            // TO-DO: Xử lý kết quả thanh toán (ví dụ: gửi thông báo nếu thất bại)

        } catch (Exception e) {
            // [COMMAND]: Ghi log lỗi nghiêm trọng khi gọi payment service
            log.error("CRITICAL: Failed to process payment for session ID {}. Error: {}", savedSession.getSessionId(), e.getMessage(), e);
            // TO-DO: Xử lý hậu quả khi thanh toán lỗi (ví dụ: đánh dấu phiên cần xử lý thủ công, gửi cảnh báo)
        }

        return convertToDto(savedSession);
    }

    // --- UPDATE (CANCEL) ---
    @Override
    public SessionResponseDto cancelSession(Long sessionId) {
        log.info("Attempting to cancel session {}", sessionId);
        ChargingSession session = findSessionById(sessionId);

        if (session.getSessionStatus() == ChargingSession.SessionStatus.charging ||
                session.getSessionStatus() == ChargingSession.SessionStatus.reserved) {

            session.setEndTime(LocalDateTime.now());
            session.setSessionStatus(ChargingSession.SessionStatus.cancelled);
            ChargingSession savedSession = sessionRepository.save(session);
            log.info("Session {} cancelled", savedSession.getSessionId());

            // Gọi sang station-service để cập nhật trụ sạc thành "available"
            updateChargerStatus(savedSession.getChargerId(), UpdateChargerStatusDto.ChargerStatus.available);

            return convertToDto(savedSession);
        } else {
            log.warn("Session {} cannot be cancelled in its current state: {}", sessionId, session.getSessionStatus());
            throw new IllegalStateException("Session cannot be cancelled in its current state: " + session.getSessionStatus());
        }
    }

    // --- READ (SINGLE) ---
    @Override
    public SessionResponseDto getSessionById(Long sessionId) {
        log.debug("Fetching session by ID {}", sessionId);
        return convertToDto(findSessionById(sessionId));
    }

    // --- READ (ALL) ---
    @Override
    public List<SessionResponseDto> getAllSessions() {
        log.debug("Fetching all sessions");
        return sessionRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // --- PRIVATE HELPER METHODS ---

    private ChargingSession findSessionById(Long sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> {
                    log.warn("Charging session not found with id: {}", sessionId);
                    return new ResourceNotFoundException("Charging session not found with id: " + sessionId);
                });
    }

    private void updateChargerStatus(Long chargerId, UpdateChargerStatusDto.ChargerStatus status) {
        try {
            UpdateChargerStatusDto statusDto = new UpdateChargerStatusDto();
            statusDto.setStatus(status);
            log.info("Updating status for charger {} to {}", chargerId, status);
            stationServiceClient.updateChargerStatus(chargerId, statusDto);
            log.info("Successfully updated status for charger {}", chargerId);
        } catch (Exception e) {
            log.error("CRITICAL: Failed to update charger status for chargerId {}. Error: {}", chargerId, e.getMessage(), e);
            // Consider adding retry logic or queuing mechanism here for production
        }
    }

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