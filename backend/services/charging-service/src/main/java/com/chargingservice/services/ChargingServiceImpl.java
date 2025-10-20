package com.chargingservice.services;

import com.chargingservice.clients.NotificationServiceClient;
import com.chargingservice.clients.PaymentServiceClient;
import com.chargingservice.clients.StationServiceClient;
import com.chargingservice.dtos.SessionResponseDto;
import com.chargingservice.dtos.StartSessionRequestDto;
import com.chargingservice.dtos.internal.CreateNotificationRequestDto;
import com.chargingservice.dtos.internal.PaymentResponseDto;
import com.chargingservice.dtos.internal.ProcessPaymentRequestDto;
import com.chargingservice.dtos.internal.UpdateChargerStatusDto;
import com.chargingservice.entities.ChargingSession;
import com.chargingservice.exceptions.ResourceNotFoundException;
import com.chargingservice.repositories.ChargingSessionRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(ChargingServiceImpl.class);

    private final ChargingSessionRepository sessionRepository;
    private final StationServiceClient stationServiceClient;
    private final PaymentServiceClient paymentServiceClient;
    private final NotificationServiceClient notificationServiceClient; // Inject Notification client

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

        // Gọi sang notification-service khi bắt đầu
        sendNotification(
                savedSession.getUserId(),
                CreateNotificationRequestDto.NotificationType.charging_started,
                "Charging Started",
                "Your charging session (ID: " + savedSession.getSessionId() + ") has started.",
                savedSession.getSessionId()
        );

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
        if (durationInSeconds <= 0) durationInSeconds = 1; // Tính ít nhất 1 giây
        double energy = durationInSeconds * 0.01;
        session.setEnergyConsumed(BigDecimal.valueOf(energy).setScale(2, BigDecimal.ROUND_HALF_UP)); // Làm tròn 2 chữ số

        ChargingSession savedSession = sessionRepository.save(session);
        log.info("Session {} stopped. Energy consumed: {} kWh", savedSession.getSessionId(), savedSession.getEnergyConsumed());

        // Bước 1: Gọi sang station-service để cập nhật trụ sạc thành "available"
        updateChargerStatus(savedSession.getChargerId(), UpdateChargerStatusDto.ChargerStatus.available);

        // Bước 2: Gọi sang payment-service để xử lý thanh toán
        PaymentResponseDto.PaymentStatus paymentStatusResult = PaymentResponseDto.PaymentStatus.failed; // Mặc định là failed
        try {
            log.info("Processing payment for session {}", savedSession.getSessionId());
            ProcessPaymentRequestDto paymentDto = new ProcessPaymentRequestDto(
                    savedSession.getSessionId(), savedSession.getUserId(),
                    savedSession.getEnergyConsumed(), new BigDecimal("3000.00") // Đơn giá tạm thời
            );
            PaymentResponseDto paymentResult = paymentServiceClient.processPayment(paymentDto);
            paymentStatusResult = paymentResult.getPaymentStatus(); // Lưu lại kết quả
            log.info("Payment processed for session {}: Status - {}", savedSession.getSessionId(), paymentStatusResult);

        } catch (Exception e) {
            log.error("CRITICAL: Failed to process payment for session ID {}. Error: {}", savedSession.getSessionId(), e.getMessage(), e);
        }

        // Bước 3: Gọi sang notification-service khi kết thúc (sau khi thanh toán)
        // Thông báo sạc hoàn tất
        sendNotification(
                savedSession.getUserId(),
                CreateNotificationRequestDto.NotificationType.charging_complete,
                "Charging Complete",
                "Your charging session (ID: " + savedSession.getSessionId() + ") is complete. Energy consumed: " + savedSession.getEnergyConsumed() + " kWh. Payment Status: " + paymentStatusResult,
                savedSession.getSessionId()
        );
        // Thông báo kết quả thanh toán
        sendNotification(
                savedSession.getUserId(),
                paymentStatusResult == PaymentResponseDto.PaymentStatus.completed ? CreateNotificationRequestDto.NotificationType.payment_success : CreateNotificationRequestDto.NotificationType.payment_failed,
                paymentStatusResult == PaymentResponseDto.PaymentStatus.completed ? "Payment Successful" : "Payment Failed",
                "Payment for session ID " + savedSession.getSessionId() + " was " + (paymentStatusResult == PaymentResponseDto.PaymentStatus.completed ? "successful." : "failed."),
                savedSession.getSessionId() // Hoặc có thể dùng paymentId nếu cần
        );

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

            // Gửi thông báo hủy (Tùy chọn)
            sendNotification(
                    savedSession.getUserId(),
                    CreateNotificationRequestDto.NotificationType.charging_failed, // Hoặc một type riêng cho cancelled
                    "Charging Cancelled",
                    "Your charging session (ID: " + savedSession.getSessionId() + ") was cancelled.",
                    savedSession.getSessionId()
            );

            return convertToDto(savedSession);
        } else {
            log.warn("Session {} cannot be cancelled in its current state: {}", sessionId, session.getSessionStatus());
            throw new IllegalStateException("Session cannot be cancelled in its current state: " + session.getSessionStatus());
        }
    }

    // --- READ (SINGLE & ALL) ---
    @Override
    public SessionResponseDto getSessionById(Long sessionId) {
        log.debug("Fetching session by ID {}", sessionId);
        return convertToDto(findSessionById(sessionId));
    }
    @Override
    public List<SessionResponseDto> getAllSessions() {
        log.debug("Fetching all sessions");
        return sessionRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // --- PRIVATE HELPER METHODS ---

    // Tìm session theo ID
    private ChargingSession findSessionById(Long sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> {
                    log.warn("Charging session not found with id: {}", sessionId);
                    return new ResourceNotFoundException("Charging session not found with id: " + sessionId);
                });
    }

    // Gọi cập nhật trạng thái trụ sạc
    private void updateChargerStatus(Long chargerId, UpdateChargerStatusDto.ChargerStatus status) {
        try {
            UpdateChargerStatusDto statusDto = new UpdateChargerStatusDto();
            statusDto.setStatus(status);
            log.info("Updating status for charger {} to {}", chargerId, status);
            stationServiceClient.updateChargerStatus(chargerId, statusDto);
            log.info("Successfully updated status for charger {}", chargerId);
        } catch (Exception e) {
            log.error("CRITICAL: Failed to update charger status for chargerId {}. Error: {}", chargerId, e.getMessage(), e);
        }
    }

    // Gọi gửi thông báo
    private void sendNotification(Long userId, CreateNotificationRequestDto.NotificationType type, String title, String message, Long referenceId) {
        try {
            log.info("Sending notification type {} for user {}", type, userId);
            CreateNotificationRequestDto notificationDto = new CreateNotificationRequestDto(userId, type, title, message, referenceId);
            notificationServiceClient.createNotification(notificationDto);
            log.info("Notification request sent successfully for user {}", userId);
        } catch (Exception e) {
            log.error("Failed to send notification request for user {}. Type: {}. Error: {}", userId, type, e.getMessage());
        }
    }

    // Chuyển đổi Entity sang DTO
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