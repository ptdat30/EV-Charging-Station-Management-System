package com.chargingservice.services;

import com.chargingservice.clients.NotificationServiceClient;
import com.chargingservice.clients.PaymentServiceClient;
import com.chargingservice.clients.StationServiceClient;
import com.chargingservice.dtos.CreateReservationRequestDto;
import com.chargingservice.dtos.internal.CreateNotificationRequestDto;
import com.chargingservice.dtos.internal.UpdateChargerStatusDto;
import com.chargingservice.dtos.ReservationResponseDto;
import com.chargingservice.dtos.SessionResponseDto;
import com.chargingservice.dtos.StartSessionRequestDto;
import com.chargingservice.dtos.internal.PaymentResponseDto;
import com.chargingservice.dtos.internal.ProcessDepositRequestDto;
import com.chargingservice.entities.ChargingSession;
import com.chargingservice.entities.Reservation;
import com.chargingservice.repositories.ChargingSessionRepository;
import com.chargingservice.repositories.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private static final Logger log = LoggerFactory.getLogger(ReservationServiceImpl.class);
    private static final BigDecimal DEFAULT_DEPOSIT_AMOUNT = new BigDecimal("50000.00"); // 50,000 VND
    
    private final ReservationRepository reservationRepository;
    private final ChargingService chargingService;
    private final ChargingSessionRepository chargingSessionRepository;
    private final StationServiceClient stationServiceClient;
    private final PaymentServiceClient paymentServiceClient;
    private final NotificationServiceClient notificationServiceClient;

    @Override
    @Transactional
    public ReservationResponseDto createReservation(CreateReservationRequestDto requestDto) {
        log.info("Creating reservation for user {} at station {}", requestDto.getUserId(), requestDto.getStationId());

        validateRequestTimes(requestDto.getReservedStartTime(), requestDto.getReservedEndTime(), requestDto.getDurationMinutes());
        
        // Kiểm tra trạng thái trạm: chỉ cho phép đặt chỗ khi trạm đang online
        try {
            Map<String, Object> station = stationServiceClient.getStationById(requestDto.getStationId());
            if (station != null) {
                String stationStatus = (String) station.get("status");
                if (stationStatus == null || !"online".equalsIgnoreCase(stationStatus)) {
                    String statusMsg = stationStatus == null ? "không xác định" :
                                       "maintenance".equalsIgnoreCase(stationStatus) ? "đang bảo trì" :
                                       "offline".equalsIgnoreCase(stationStatus) ? "tạm ngưng" :
                                       "closed".equalsIgnoreCase(stationStatus) ? "đã đóng cửa" : stationStatus;
                    throw new IllegalStateException("Trạm " + statusMsg + ". Không thể đặt chỗ hoặc sạc tại thời điểm này.");
                }
            }
        } catch (IllegalStateException e) {
            throw e; // Re-throw validation errors
        } catch (Exception e) {
            log.warn("Could not verify station status, proceeding anyway: {}", e.getMessage());
            // Continue if station service is unavailable (fail gracefully)
        }
        
        Long chargerId = requestDto.getChargerId();
        
        // Nếu chargerId null, tự động tìm charger available tại station
        if (chargerId == null) {
            log.info("chargerId is null, finding available charger at station {}", requestDto.getStationId());
            // findAvailableCharger sẽ throw IllegalStateException với thông báo chi tiết nếu không tìm thấy
            chargerId = findAvailableCharger(requestDto.getStationId(), requestDto.getReservedStartTime(), requestDto.getReservedEndTime());
            log.info("Found available charger: {}", chargerId);
        }

        // Check charger has no active charging session
        chargingSessionRepository.findFirstByChargerIdAndSessionStatus(chargerId, ChargingSession.SessionStatus.charging)
                .ifPresent(s -> { throw new IllegalStateException("Charger is currently in use by an active session"); });

        // Overlap check with existing reservations on same charger (pending/confirmed/active)
        List<Reservation.ReservationStatus> blockingStatuses = Arrays.asList(
                Reservation.ReservationStatus.pending,
                Reservation.ReservationStatus.confirmed,
                Reservation.ReservationStatus.active
        );
        List<Reservation> overlaps = reservationRepository.findOverlappingReservations(
                chargerId,
                requestDto.getReservedStartTime(),
                requestDto.getReservedEndTime(),
                blockingStatuses
        );
        if (!overlaps.isEmpty()) {
            throw new IllegalStateException("Time window overlaps with another reservation on this charger");
        }

        Reservation reservation = new Reservation();
        reservation.setUserId(requestDto.getUserId());
        reservation.setStationId(requestDto.getStationId());
        reservation.setChargerId(chargerId);
        reservation.setReservedStartTime(requestDto.getReservedStartTime());
        reservation.setReservedEndTime(requestDto.getReservedEndTime());
        reservation.setDurationMinutes(requestDto.getDurationMinutes());
        reservation.setStatus(Reservation.ReservationStatus.confirmed); // Confirm ngay, không cần deposit
        reservation.setConfirmationCode(generateConfirmationCode());
        
        // Save first to get reservationId
        Reservation saved = reservationRepository.save(reservation);
        log.info("Reservation created: {}", saved.getReservationId());

        // Generate QR code after save (when reservationId is available)
        saved.setQrCode(generateQRCode(saved));
        
        // Update charger status to "reserved"
        try {
            UpdateChargerStatusDto updateStatus = new UpdateChargerStatusDto();
            updateStatus.setStatus(UpdateChargerStatusDto.ChargerStatus.reserved);
            stationServiceClient.updateChargerStatus(chargerId, updateStatus);
            log.info("Updated charger {} status to reserved", chargerId);
        } catch (Exception e) {
            log.warn("Failed to update charger status to reserved: {}", e.getMessage());
            // Continue even if charger status update fails
        }
        
        // Send notification to admin about new reservation
        try {
            notificationServiceClient.createNotification(new CreateNotificationRequestDto(
                    null, // null = send to all admins (notification service will handle this)
                    CreateNotificationRequestDto.NotificationType.reservation_confirmed,
                    "Đặt chỗ mới",
                    String.format("Có đặt chỗ mới tại trạm %d, trụ sạc %d. Thời gian: %s đến %s",
                            saved.getStationId(), saved.getChargerId(),
                            saved.getReservedStartTime(), saved.getReservedEndTime()),
                    saved.getReservationId()
            ));
            log.info("Notification sent to admin about new reservation {}", saved.getReservationId());
        } catch (Exception e) {
            log.warn("Failed to send notification to admin: {}", e.getMessage());
            // Continue even if notification fails
        }
        
        // Also send notification to user
        try {
            notificationServiceClient.createNotification(new CreateNotificationRequestDto(
                    requestDto.getUserId(),
                    CreateNotificationRequestDto.NotificationType.reservation_confirmed,
                    "Đặt chỗ thành công",
                    String.format("Bạn đã đặt chỗ thành công. Mã xác nhận: %s. Thời gian: %s đến %s",
                            saved.getConfirmationCode(),
                            saved.getReservedStartTime(), saved.getReservedEndTime()),
                    saved.getReservationId()
            ));
            log.info("Notification sent to user {} about reservation {}", requestDto.getUserId(), saved.getReservationId());
        } catch (Exception e) {
            log.warn("Failed to send notification to user: {}", e.getMessage());
            // Continue even if notification fails
        }
        
        saved = reservationRepository.save(saved);
        log.info("Reservation confirmed: {}", saved.getReservationId());

        return convertToDto(saved);
    }

    @Override
    public ReservationResponseDto getReservationById(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found: " + reservationId));
        return convertToDto(reservation);
    }

    @Override
    public List<ReservationResponseDto> getReservationsByUserId(Long userId) {
        return reservationRepository.findByUserIdOrderByReservedStartTimeDesc(userId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReservationResponseDto cancelReservation(Long reservationId, Long userId, String reason) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found: " + reservationId));

        if (!reservation.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Reservation belongs to different user");
        }

        reservation.setStatus(Reservation.ReservationStatus.cancelled);
        reservation.setCancellationReason(reason);
        reservation.setCancelledAt(LocalDateTime.now());

        Reservation saved = reservationRepository.save(reservation);
        
        // Update charger status to available
        try {
            UpdateChargerStatusDto updateStatus = new UpdateChargerStatusDto();
            updateStatus.setStatus(UpdateChargerStatusDto.ChargerStatus.available);
            stationServiceClient.updateChargerStatus(reservation.getChargerId(), updateStatus);
            log.info("Updated charger {} status to available after reservation cancellation", reservation.getChargerId());
        } catch (Exception e) {
            log.warn("Failed to update charger status to available: {}", e.getMessage());
        }
        
        return convertToDto(saved);
    }

    @Override
    @Transactional
    public ReservationResponseDto adminCancelReservation(Long reservationId, String reason) {
        log.info("Admin cancelling reservation {}", reservationId);
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found: " + reservationId));

        reservation.setStatus(Reservation.ReservationStatus.cancelled);
        reservation.setCancellationReason(reason != null ? reason : "Cancelled by admin");
        reservation.setCancelledAt(LocalDateTime.now());

        Reservation saved = reservationRepository.save(reservation);
        
        // Update charger status to available
        try {
            UpdateChargerStatusDto updateStatus = new UpdateChargerStatusDto();
            updateStatus.setStatus(UpdateChargerStatusDto.ChargerStatus.available);
            stationServiceClient.updateChargerStatus(reservation.getChargerId(), updateStatus);
            log.info("Updated charger {} status to available after admin cancellation", reservation.getChargerId());
        } catch (Exception e) {
            log.warn("Failed to update charger status to available: {}", e.getMessage());
        }
        
        // Send notification to user
        try {
            CreateNotificationRequestDto notification = new CreateNotificationRequestDto();
            notification.setUserId(reservation.getUserId());
            notification.setNotificationType(CreateNotificationRequestDto.NotificationType.reservation_cancelled);
            notification.setTitle("Đặt chỗ đã bị hủy bởi quản trị viên");
            notification.setMessage(String.format(
                    "Đặt chỗ ID %d của bạn đã bị hủy bởi quản trị viên. " +
                    "Lý do: %s. Tiền cọc sẽ được hoàn lại.",
                    reservation.getReservationId(),
                    reason != null ? reason : "Không xác định"));
            notification.setReferenceId(reservation.getReservationId());
            
            notificationServiceClient.createNotification(notification);
        } catch (Exception e) {
            log.error("Error sending cancellation notification: {}", e.getMessage());
        }
        
        return convertToDto(saved);
    }

    @Override
    public List<ReservationResponseDto> getAllReservations() {
        log.debug("Fetching all reservations for admin");
        return reservationRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Check-in for reservation - must be within 15 minutes after reservedStartTime
     * Returns deposit if check-in successful
     */
    @Override
    @Transactional
    public ReservationResponseDto checkIn(Long reservationId, Long userId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found: " + reservationId));

        if (!reservation.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Reservation belongs to different user");
        }

        if (reservation.getStatus() != Reservation.ReservationStatus.confirmed) {
            throw new IllegalStateException("Reservation must be in confirmed status to check-in. Current status: " + reservation.getStatus());
        }

        if (reservation.getIsCheckedIn() != null && reservation.getIsCheckedIn()) {
            throw new IllegalStateException("Reservation already checked in");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reservedStartTime = reservation.getReservedStartTime();
        LocalDateTime checkInDeadline = reservation.getCheckInDeadline();
        
        // Check-in window: 30 minutes before reservedStartTime until checkInDeadline (15 minutes after)
        LocalDateTime earliestCheckIn = reservedStartTime.minusMinutes(30);
        
        if (now.isBefore(earliestCheckIn)) {
            long minutesUntil = Duration.between(now, earliestCheckIn).toMinutes();
            throw new IllegalStateException(
                String.format("Check-in is not available yet. You can check in 30 minutes before your reservation time. Please check in after %s", 
                    earliestCheckIn.toLocalTime().toString()));
        }
        
        if (checkInDeadline != null && now.isAfter(checkInDeadline)) {
            throw new IllegalStateException(
                String.format("Check-in deadline has passed. The deadline was %s. Deposit cannot be refunded.", 
                    checkInDeadline.toString()));
        }

        // Mark as checked in
        reservation.setIsCheckedIn(true);
        reservation.setCheckInTime(now);
        
        // Refund deposit if not already refunded
        if (reservation.getDepositAmount() != null && 
            reservation.getDepositPaymentId() != null &&
            (reservation.getDepositRefunded() == null || !reservation.getDepositRefunded())) {
            
            try {
                // Call payment service to refund deposit
                com.chargingservice.dtos.internal.RefundDepositRequestDto refundRequest = 
                    new com.chargingservice.dtos.internal.RefundDepositRequestDto();
                refundRequest.setReservationId(reservationId);
                refundRequest.setPaymentId(reservation.getDepositPaymentId()); // Use depositPaymentId to find payment
                refundRequest.setUserId(userId);
                refundRequest.setAmount(reservation.getDepositAmount());
                
                PaymentResponseDto refundResponse = paymentServiceClient.refundDeposit(refundRequest);
                
                if (refundResponse != null && 
                    refundResponse.getPaymentStatus() == PaymentResponseDto.PaymentStatus.completed) {
                    reservation.setDepositRefunded(true);
                    log.info("Deposit refunded successfully for reservation {}. Payment ID: {}", 
                        reservationId, refundResponse.getPaymentId());
                } else {
                    log.warn("Deposit refund failed for reservation {}. Status: {}", 
                        reservationId, refundResponse != null ? refundResponse.getPaymentStatus() : "null");
                    // Still mark check-in as successful, but log the refund failure
                }
            } catch (Exception e) {
                log.error("Error refunding deposit for reservation {}: {}", reservationId, e.getMessage(), e);
                // Still mark check-in as successful, but log the refund failure
            }
        }
        
        reservation = reservationRepository.save(reservation);
        log.info("Check-in successful for reservation {}", reservationId);
        
        return convertToDto(reservation);
    }

    @Override
    @Transactional
    public Object startSessionFromReservation(Long reservationId, Long userId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found: " + reservationId));

        if (!reservation.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (reservation.getStatus() != Reservation.ReservationStatus.confirmed) {
            throw new RuntimeException("Reservation is not in confirmed status");
        }

        // Start charging session
        StartSessionRequestDto sessionRequest = new StartSessionRequestDto();
        sessionRequest.setUserId(userId);
        sessionRequest.setStationId(reservation.getStationId());
        sessionRequest.setChargerId(reservation.getChargerId());

        SessionResponseDto session = chargingService.startSession(sessionRequest);

        // Link session to reservation
        reservation.setSessionId(session.getSessionId());
        reservation.setStatus(Reservation.ReservationStatus.active);
        reservationRepository.save(reservation);
        
        // Update charger status from reserved to in_use
        try {
            UpdateChargerStatusDto updateStatus = new UpdateChargerStatusDto();
            updateStatus.setStatus(UpdateChargerStatusDto.ChargerStatus.in_use);
            stationServiceClient.updateChargerStatus(reservation.getChargerId(), updateStatus);
            log.info("Updated charger {} status from reserved to in_use", reservation.getChargerId());
        } catch (Exception e) {
            log.warn("Failed to update charger status to in_use: {}", e.getMessage());
        }

        return session;
    }
    
    /**
     * Start session from QR code (quét QR code tại trạm)
     */
    @Override
    @Transactional
    public SessionResponseDto startSessionFromQRCode(String qrCode, Long userId) {
        log.info("Starting session from QR code: {} for user {}", qrCode, userId);
        
        // Tìm reservation bằng QR code
        Reservation reservation = reservationRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new RuntimeException("Reservation not found for QR code: " + qrCode));
        
        // Validate user
        if (!reservation.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: QR code does not belong to you");
        }
        
        // Validate status
        if (reservation.getStatus() != Reservation.ReservationStatus.confirmed) {
            throw new IllegalStateException("Reservation is not in confirmed status. Current status: " + reservation.getStatus());
        }
        
        // Check if session already started
        if (reservation.getSessionId() != null) {
            throw new IllegalStateException("Session already started for this reservation. Session ID: " + reservation.getSessionId());
        }
        
        // Start charging session
        StartSessionRequestDto sessionRequest = new StartSessionRequestDto();
        sessionRequest.setUserId(userId);
        sessionRequest.setStationId(reservation.getStationId());
        sessionRequest.setChargerId(reservation.getChargerId());
        
        SessionResponseDto session = chargingService.startSession(sessionRequest);
        
        // Link session to reservation
        reservation.setSessionId(session.getSessionId());
        reservation.setStatus(Reservation.ReservationStatus.active);
        reservationRepository.save(reservation);
        
        // Update charger status from reserved to in_use
        try {
            UpdateChargerStatusDto updateStatus = new UpdateChargerStatusDto();
            updateStatus.setStatus(UpdateChargerStatusDto.ChargerStatus.in_use);
            stationServiceClient.updateChargerStatus(reservation.getChargerId(), updateStatus);
            log.info("Updated charger {} status from reserved to in_use", reservation.getChargerId());
        } catch (Exception e) {
            log.warn("Failed to update charger status to in_use: {}", e.getMessage());
        }
        
        log.info("Session {} started from QR code {} for reservation {}", session.getSessionId(), qrCode, reservation.getReservationId());
        return session;
    }

    private void validateRequestTimes(LocalDateTime start, LocalDateTime end, Integer durationMinutes) {
        log.debug("Validating times - start: {}, end: {}, durationMinutes: {}", start, end, durationMinutes);
        
        if (start == null || end == null || durationMinutes == null) {
            throw new IllegalArgumentException("Start, end and durationMinutes are required. Got: start=" + start + ", end=" + end + ", duration=" + durationMinutes);
        }
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("End time must be after start time. Start: " + start + ", End: " + end);
        }
        long minutes = Duration.between(start, end).toMinutes();
        if (minutes <= 0) {
            throw new IllegalArgumentException("Invalid reservation duration: " + minutes + " minutes");
        }
        // Allow small difference (±1 minute) due to rounding
        if (Math.abs(minutes - durationMinutes.longValue()) > 1) {
            throw new IllegalArgumentException(String.format(
                "durationMinutes (%d) does not match the difference between start and end (%d minutes). Start: %s, End: %s", 
                durationMinutes, minutes, start, end));
        }
        
        LocalDateTime now = LocalDateTime.now();
        if (start.isBefore(now)) {
            long minutesPast = Duration.between(start, now).toMinutes();
            throw new IllegalArgumentException(String.format(
                "Thời gian bắt đầu phải là thời gian trong tương lai. Thời gian đã chọn đã qua %d phút. Vui lòng chọn thời gian muộn hơn.",
                minutesPast));
        }
        
        // Require minimum 30 minutes advance booking
        long minutesUntilStart = Duration.between(now, start).toMinutes();
        if (minutesUntilStart < 30) {
            throw new IllegalArgumentException(String.format(
                "Thời gian bắt đầu phải cách hiện tại ít nhất 30 phút. Hiện tại: %s, Thời gian đã chọn: %s. Vui lòng chọn thời gian muộn hơn ít nhất 30 phút.",
                now, start));
        }
    }

    private String generateConfirmationCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String generateQRCode(Reservation reservation) {
        // Generate QR code data (can be JSON or simple string)
        // reservationId is now guaranteed to be non-null since we save before calling this
        return "RES:" + reservation.getReservationId() + ":" + reservation.getConfirmationCode();
    }

    /**
     * Tìm charger available tại station cho time slot được yêu cầu
     */
    private Long findAvailableCharger(Long stationId, LocalDateTime startTime, LocalDateTime endTime) {
        try {
            log.info("Finding available charger at station {} for time slot {} - {}", stationId, startTime, endTime);
            // Lấy danh sách chargers từ station-service
            List<Map<String, Object>> chargers;
            try {
                log.info("Calling station-service to get chargers for station {}", stationId);
                chargers = stationServiceClient.getChargersByStationId(stationId);
                log.info("Received {} chargers from station-service", chargers != null ? chargers.size() : 0);
            } catch (org.springframework.cloud.client.circuitbreaker.NoFallbackAvailableException e) {
                log.error("STATION-SERVICE không khả dụng (Circuit breaker). Có thể service chưa chạy hoặc chưa đăng ký với Eureka. Error: {}", e.getMessage());
                throw new IllegalStateException("Trạm sạc service hiện không khả dụng. Vui lòng đảm bảo Station Service đang chạy và đã đăng ký với Eureka.");
            } catch (feign.FeignException.NotFound e) {
                log.error("Station {} không tồn tại (404): {}", stationId, e.getMessage());
                throw new IllegalStateException("Trạm " + stationId + " không tồn tại. Vui lòng chọn trạm khác.");
            } catch (feign.FeignException e) {
                log.error("Feign exception when calling station-service for station {}: Status={}, Message={}", 
                        stationId, e.status(), e.getMessage());
                throw new IllegalStateException("Không thể kết nối đến trạm sạc service (HTTP " + e.status() + 
                        "). Vui lòng kiểm tra Station Service đang chạy.");
            } catch (org.springframework.web.client.ResourceAccessException e) {
                // ResourceAccessException wraps ConnectException, SocketTimeoutException, and other connection issues
                log.error("Resource access exception when calling station-service for station {}: {} (Cause: {})", 
                        stationId, e.getMessage(), e.getCause() != null ? e.getCause().getClass().getSimpleName() : "unknown");
                throw new IllegalStateException("Không thể kết nối đến trạm sạc service. Vui lòng đảm bảo Station Service đang chạy (port 9001) và đã đăng ký với Eureka.");
            } catch (Exception e) {
                log.error("Unexpected error when calling station-service for station {}: {} - {}", 
                        stationId, e.getClass().getSimpleName(), e.getMessage(), e);
                throw new IllegalStateException("Lỗi khi lấy danh sách trụ sạc từ trạm " + stationId + ": " + 
                        (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()) + 
                        ". Vui lòng kiểm tra Station Service đang chạy.");
            }
            
            if (chargers == null || chargers.isEmpty()) {
                log.warn("No chargers found at station {}. This station may not have any chargers configured.", stationId);
                throw new IllegalStateException("Trạm " + stationId + " không có trụ sạc nào. Vui lòng chọn trạm khác.");
            }
            
            log.info("Found {} chargers at station {}", chargers.size(), stationId);

            List<Reservation.ReservationStatus> blockingStatuses = Arrays.asList(
                    Reservation.ReservationStatus.pending,
                    Reservation.ReservationStatus.confirmed,
                    Reservation.ReservationStatus.active
            );

            // Tìm charger available (status = available hoặc reserved) và không có overlap
            int availableCount = 0;
            int busyCount = 0;
            int invalidStatusCount = 0;
            int hasActiveSessionCount = 0;
            int hasOverlapCount = 0;
            
            for (Map<String, Object> charger : chargers) {
                // Try multiple possible keys for charger ID (chargerId, id, charger_id)
                Long chargerId = getLongValue(charger, "chargerId");
                if (chargerId == null) {
                    chargerId = getLongValue(charger, "id");
                }
                if (chargerId == null) {
                    chargerId = getLongValue(charger, "charger_id");
                }
                
                // Try multiple possible keys for status
                Object statusObj = charger.get("status");
                if (statusObj == null) {
                    statusObj = charger.get("chargerStatus");
                }
                
                // Convert status to string (handle both enum and string)
                String status = null;
                if (statusObj != null) {
                    status = statusObj.toString(); // Works for both enum and string
                }
                
                if (chargerId == null) {
                    log.warn("Skipping charger with null chargerId. Available keys: {}", charger.keySet());
                    continue;
                }
                
                log.debug("Checking charger {} with status {} (type: {}, keys: {})", 
                        chargerId, status, statusObj != null ? statusObj.getClass().getSimpleName() : "null", charger.keySet());
                
                // Chỉ xét chargers có status available, reserved, hoặc null (coi như available)
                // Status có thể là: AVAILABLE, available, RESERVED, reserved (enum hoặc string)
                if (status != null) {
                    String statusLower = status.toLowerCase();
                    if (!"available".equals(statusLower) && !"reserved".equals(statusLower)) {
                        invalidStatusCount++;
                        log.debug("Charger {} has invalid status: {} (not available or reserved)", chargerId, status);
                        continue;
                    }
                }
                
                availableCount++;
                
                // Kiểm tra không có active charging session
                boolean hasActiveSession = chargingSessionRepository
                        .findFirstByChargerIdAndSessionStatus(chargerId, ChargingSession.SessionStatus.charging)
                        .isPresent();
                
                if (hasActiveSession) {
                    hasActiveSessionCount++;
                    log.debug("Charger {} has active charging session, skipping", chargerId);
                    continue;
                }

                // Kiểm tra không có overlapping reservations
                List<Reservation> overlaps = reservationRepository.findOverlappingReservations(
                        chargerId, startTime, endTime, blockingStatuses
                );
                
                if (!overlaps.isEmpty()) {
                    hasOverlapCount++;
                    log.debug("Charger {} has {} overlapping reservations, skipping", chargerId, overlaps.size());
                    continue;
                }
                
                // Tìm thấy charger available!
                log.info("Found available charger {} at station {}", chargerId, stationId);
                return chargerId;
            }
            
            // Log chi tiết về lý do không tìm thấy charger
            StringBuilder reasonMsg = new StringBuilder();
            reasonMsg.append("Tổng số trụ sạc: ").append(chargers.size()).append(", ");
            reasonMsg.append("Trạng thái hợp lệ: ").append(availableCount).append(", ");
            
            if (invalidStatusCount > 0) {
                reasonMsg.append("Đang bận/offline/maintenance: ").append(invalidStatusCount).append(", ");
            }
            if (hasActiveSessionCount > 0) {
                reasonMsg.append("Đang sạc: ").append(hasActiveSessionCount).append(", ");
            }
            if (hasOverlapCount > 0) {
                reasonMsg.append("Đã được đặt chỗ: ").append(hasOverlapCount);
            }
            
            log.warn("No available charger found at station {} for time slot {} - {}. " +
                    "Summary: total={}, available_status={}, has_active_session={}, has_overlap={}, invalid_status={}. {}",
                    stationId, startTime, endTime, chargers.size(), availableCount, 
                    hasActiveSessionCount, hasOverlapCount, invalidStatusCount, reasonMsg.toString());
            
            // Tạo thông báo lỗi chi tiết cho user
            String errorMessage = String.format(
                "Tất cả các trụ sạc tại trạm %d đều không khả dụng cho khung giờ %s - %s. " +
                "Lý do: %s. Vui lòng thử chọn khung giờ khác hoặc trạm khác.",
                stationId, startTime, endTime, reasonMsg.toString()
            );
            throw new IllegalStateException(errorMessage);
        } catch (IllegalStateException e) {
            // Re-throw IllegalStateException (đã có thông báo lỗi chi tiết)
            throw e;
        } catch (Exception e) {
            log.error("Error finding available charger at station {}: {}", stationId, e.getMessage(), e);
            throw new IllegalStateException("Lỗi khi tìm trụ sạc tại trạm " + stationId + ": " + e.getMessage());
        }
    }

    /**
     * Helper method để lấy Long value từ Map
     */
    private Long getLongValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Long) return (Long) value;
        if (value instanceof Integer) return ((Integer) value).longValue();
        if (value instanceof Number) return ((Number) value).longValue();
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * Tính toán số tiền deposit cần thu
     * Có thể tính dựa trên duration, charger type, hoặc cố định
     */
    private BigDecimal calculateDepositAmount(Reservation reservation) {
        // Hiện tại dùng giá trị cố định, có thể mở rộng sau
        // Có thể tính: deposit = durationMinutes * pricePerMinute * depositRate
        return DEFAULT_DEPOSIT_AMOUNT;
    }

    private ReservationResponseDto convertToDto(Reservation r) {
        ReservationResponseDto dto = new ReservationResponseDto();
        dto.setReservationId(r.getReservationId());
        dto.setUserId(r.getUserId());
        dto.setStationId(r.getStationId());
        dto.setChargerId(r.getChargerId());
        dto.setSessionId(r.getSessionId());
        dto.setReservedStartTime(r.getReservedStartTime());
        dto.setReservedEndTime(r.getReservedEndTime());
        dto.setDurationMinutes(r.getDurationMinutes());
        dto.setStatus(r.getStatus());
        dto.setQrCode(r.getQrCode());
        dto.setConfirmationCode(r.getConfirmationCode());
        dto.setCancellationReason(r.getCancellationReason());
        dto.setCancelledAt(r.getCancelledAt());
        
        // Deposit info
        dto.setDepositAmount(r.getDepositAmount());
        dto.setDepositRefunded(r.getDepositRefunded() != null ? r.getDepositRefunded() : false);
        
        // Check-in info
        dto.setCheckInTime(r.getCheckInTime());
        dto.setCheckInDeadline(r.getCheckInDeadline());
        dto.setIsCheckedIn(r.getIsCheckedIn() != null ? r.getIsCheckedIn() : false);
        
        // No-show info
        dto.setNoShowCount(r.getNoShowCount() != null ? r.getNoShowCount() : 0);
        
        dto.setCreatedAt(r.getCreatedAt());
        dto.setUpdatedAt(r.getUpdatedAt());
        return dto;
    }
}

