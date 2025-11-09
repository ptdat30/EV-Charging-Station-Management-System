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
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import com.chargingservice.clients.UserServiceClient;

@Service
@RequiredArgsConstructor
public class ChargingServiceImpl implements ChargingService {

    private static final Logger log = LoggerFactory.getLogger(ChargingServiceImpl.class);

    private final ChargingSessionRepository sessionRepository;
    private final StationServiceClient stationServiceClient;
    private final PaymentServiceClient paymentServiceClient;
    private final NotificationServiceClient notificationServiceClient; // Inject Notification client
    private final UserServiceClient userServiceClient;
    
    // Base price per kWh
    private static final BigDecimal BASE_PRICE_PER_KWH = new BigDecimal("3000.00");

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

        // Tính toán năng lượng tiêu thụ (0.6 kWh/phút = 36 kW)
        long durationInMinutes = Duration.between(session.getStartTime(), session.getEndTime()).toMinutes();
        if (durationInMinutes <= 0) durationInMinutes = 1; // Tính ít nhất 1 phút
        double energy = durationInMinutes * 0.6; // 0.6 kWh/phút
        session.setEnergyConsumed(BigDecimal.valueOf(energy).setScale(2, RoundingMode.HALF_UP));
        
        // Tính SOC cuối cùng
        BigDecimal batteryCapacity = new BigDecimal("80.00"); // kWh
        BigDecimal energyCharged = session.getEnergyConsumed();
        double finalSOC = 20.0 + (energyCharged.doubleValue() / batteryCapacity.doubleValue() * 80.0);
        if (finalSOC > 100.0) finalSOC = 100.0;
        boolean isFullyCharged = finalSOC >= 99.9; // Gần 100%

        ChargingSession savedSession = sessionRepository.save(session);
        log.info("Session {} stopped. Energy consumed: {} kWh, Final SOC: {:.2f}%", 
                savedSession.getSessionId(), savedSession.getEnergyConsumed(), finalSOC);

        // Bước 1: Gọi sang station-service để cập nhật trụ sạc thành "available"
        updateChargerStatus(savedSession.getChargerId(), UpdateChargerStatusDto.ChargerStatus.available);

        // Bước 2: KHÔNG tự động thanh toán - Driver sẽ chọn payment method sau
        // Payment sẽ được xử lý khi driver chọn payment method từ frontend
        // Tạm thời không tạo payment record, sẽ tạo khi driver chọn method

        // Bước 3: Gọi sang notification-service khi kết thúc
        // Thông báo sạc hoàn tất - yêu cầu thanh toán
        String chargingCompleteMessage;
        if (isFullyCharged) {
            chargingCompleteMessage = String.format(
                "Pin đã sạc đầy! Phiên sạc (ID: %d) hoàn tất. Năng lượng: %.2f kWh. SOC: %.1f%%. Vui lòng thanh toán.",
                savedSession.getSessionId(), savedSession.getEnergyConsumed().doubleValue(), finalSOC
            );
        } else {
            chargingCompleteMessage = String.format(
                "Phiên sạc (ID: %d) hoàn tất. Năng lượng: %.2f kWh. SOC: %.1f%%. Vui lòng thanh toán.",
                savedSession.getSessionId(), savedSession.getEnergyConsumed().doubleValue(), finalSOC
            );
        }
        
        sendNotification(
                savedSession.getUserId(),
                CreateNotificationRequestDto.NotificationType.charging_complete,
                isFullyCharged ? "Pin đã sạc đầy!" : "Sạc hoàn tất",
                chargingCompleteMessage,
                savedSession.getSessionId()
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
    
    @Override
    public com.chargingservice.dtos.SessionStatusDto getSessionStatus(Long sessionId) {
        ChargingSession session = findSessionById(sessionId);
        
        // Chỉ tính toán cho session đang charging
        if (session.getSessionStatus() != ChargingSession.SessionStatus.charging) {
            // Trả về status cơ bản cho session không đang sạc
            com.chargingservice.dtos.SessionStatusDto statusDto = new com.chargingservice.dtos.SessionStatusDto();
            statusDto.setSessionId(session.getSessionId());
            statusDto.setStatus(session.getSessionStatus());
            statusDto.setEnergyCharged(session.getEnergyConsumed() != null ? session.getEnergyConsumed() : BigDecimal.ZERO);
            statusDto.setPricePerKwh(calculatePriceWithDiscount(session.getUserId()));
            return statusDto;
        }
        
        // Tính toán trạng thái sạc real-time
        LocalDateTime now = LocalDateTime.now();
        long minutesElapsed = Duration.between(session.getStartTime(), now).toMinutes();
        if (minutesElapsed < 0) minutesElapsed = 0;
        
        // Giả lập: tốc độ sạc 0.01 kWh/giây = 0.6 kWh/phút = 36 kW
        BigDecimal chargingPower = new BigDecimal("36.00"); // kW
        BigDecimal energyCharged = BigDecimal.valueOf(minutesElapsed * 0.6).setScale(2, RoundingMode.HALF_UP);
        
        // Giả lập SOC: bắt đầu từ 20%, sạc lên 100%
        // Giả sử cần 80% để sạc đầy = 80 kWh (giả lập)
        BigDecimal batteryCapacity = new BigDecimal("80.00"); // kWh (giả lập)
        BigDecimal socPercentage = BigDecimal.valueOf(20.0 + (energyCharged.doubleValue() / batteryCapacity.doubleValue() * 80.0));
        if (socPercentage.doubleValue() > 100.0) socPercentage = new BigDecimal("100.0");
        
        // Tính thời gian còn lại (phút)
        BigDecimal remainingEnergy = batteryCapacity.subtract(energyCharged);
        if (remainingEnergy.doubleValue() < 0) remainingEnergy = BigDecimal.ZERO;
        int estimatedMinutesRemaining = 0;
        if (chargingPower.doubleValue() > 0 && remainingEnergy.doubleValue() > 0) {
            // kW to kWh/min: chargingPower (kW) / 60 = kWh per minute
            BigDecimal chargingRatePerMinute = chargingPower.divide(new BigDecimal("60"), 4, RoundingMode.HALF_UP);
            if (chargingRatePerMinute.doubleValue() > 0) {
                estimatedMinutesRemaining = (int) Math.ceil(remainingEnergy.divide(chargingRatePerMinute, 0, RoundingMode.UP).doubleValue());
            }
        }
        
        // Đơn giá với discount dựa trên subscription package
        BigDecimal pricePerKwh = calculatePriceWithDiscount(session.getUserId());
        BigDecimal currentCost = energyCharged.multiply(pricePerKwh).setScale(0, RoundingMode.HALF_UP);
        BigDecimal estimatedTotalCost = batteryCapacity.multiply(pricePerKwh).setScale(0, RoundingMode.HALF_UP);
        
        // Tạo DTO
        com.chargingservice.dtos.SessionStatusDto statusDto = new com.chargingservice.dtos.SessionStatusDto();
        statusDto.setSessionId(session.getSessionId());
        statusDto.setStatus(session.getSessionStatus());
        statusDto.setCurrentSOC(socPercentage.doubleValue());
        statusDto.setEstimatedMinutesRemaining(estimatedMinutesRemaining);
        statusDto.setEstimatedEndTime(now.plusMinutes(estimatedMinutesRemaining));
        statusDto.setEnergyCharged(energyCharged);
        statusDto.setEstimatedTotalEnergy(batteryCapacity);
        statusDto.setCurrentCost(currentCost);
        statusDto.setEstimatedTotalCost(estimatedTotalCost);
        statusDto.setPricePerKwh(pricePerKwh);
        statusDto.setMinutesElapsed(minutesElapsed);
        statusDto.setChargingPower(chargingPower);
        
        return statusDto;
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

    // Tính giá với discount dựa trên subscription package
    private BigDecimal calculatePriceWithDiscount(Long userId) {
        try {
            // Get user subscription package
            Map<String, Object> userResponse = userServiceClient.getUserById(userId);
            String subscriptionPackage = (String) userResponse.get("subscriptionPackage");
            
            if (subscriptionPackage == null) {
                log.debug("User {} has no subscription package, using base price", userId);
                return BASE_PRICE_PER_KWH;
            }
            
            // Apply discount based on package
            BigDecimal discountRate = getDiscountRate(subscriptionPackage);
            BigDecimal discountedPrice = BASE_PRICE_PER_KWH.multiply(BigDecimal.ONE.subtract(discountRate));
            
            log.info("User {} with package {} gets {}% discount. Price: {} VND/kWh", 
                    userId, subscriptionPackage, discountRate.multiply(new BigDecimal("100")), discountedPrice);
            
            return discountedPrice.setScale(2, RoundingMode.HALF_UP);
            
        } catch (Exception e) {
            log.error("Error getting subscription for user {}: {}", userId, e.getMessage());
            return BASE_PRICE_PER_KWH;
        }
    }
    
    // Get discount rate based on subscription package
    private BigDecimal getDiscountRate(String packageType) {
        switch (packageType.toUpperCase()) {
            case "SILVER":
                return new BigDecimal("0.25"); // 25% discount
            case "GOLD":
                return new BigDecimal("0.40"); // 40% discount
            case "PLATINUM":
                return new BigDecimal("0.50"); // 50% discount
            default:
                return BigDecimal.ZERO;
        }
    }

    @Override
    @Transactional
    public void markSessionAsPaid(Long sessionId, Long paymentId) {
        log.info("Marking session {} as paid with payment {}", sessionId, paymentId);
        ChargingSession session = findSessionById(sessionId);
        session.setIsPaid(true);
        session.setPaymentId(paymentId);
        sessionRepository.save(session);
        log.info("Session {} marked as paid", sessionId);
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
        dto.setIsPaid(session.getIsPaid() != null ? session.getIsPaid() : false);
        dto.setPaymentId(session.getPaymentId());
        dto.setCreatedAt(session.getCreatedAt());
        return dto;
    }
}