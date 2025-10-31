package com.chargingservice.services;

import com.chargingservice.clients.PaymentServiceClient;
import com.chargingservice.clients.StationServiceClient;
import com.chargingservice.dtos.CreateReservationRequestDto;
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

    @Override
    @Transactional
    public ReservationResponseDto createReservation(CreateReservationRequestDto requestDto) {
        log.info("Creating reservation for user {} at station {}", requestDto.getUserId(), requestDto.getStationId());

        validateRequestTimes(requestDto.getReservedStartTime(), requestDto.getReservedEndTime(), requestDto.getDurationMinutes());
        
        Long chargerId = requestDto.getChargerId();
        
        // Nếu chargerId null, tự động tìm charger available tại station
        if (chargerId == null) {
            log.info("chargerId is null, finding available charger at station {}", requestDto.getStationId());
            chargerId = findAvailableCharger(requestDto.getStationId(), requestDto.getReservedStartTime(), requestDto.getReservedEndTime());
            if (chargerId == null) {
                throw new IllegalStateException("No available charger found at station " + requestDto.getStationId() + " for the requested time slot");
            }
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
        reservation.setStatus(Reservation.ReservationStatus.pending); // Start as pending until deposit is paid
        reservation.setConfirmationCode(generateConfirmationCode());
        
        // Save first to get reservationId
        Reservation saved = reservationRepository.save(reservation);
        log.info("Reservation created (pending deposit): {}", saved.getReservationId());

        // Generate QR code after save (when reservationId is available)
        saved.setQrCode(generateQRCode(saved));
        
        // Calculate and process deposit
        BigDecimal depositAmount = calculateDepositAmount(saved);
        saved.setDepositAmount(depositAmount);
        saved.setCheckInDeadline(saved.getReservedStartTime().plusMinutes(15));
        
        try {
            // Process deposit payment
            ProcessDepositRequestDto depositRequest = new ProcessDepositRequestDto();
            depositRequest.setReservationId(saved.getReservationId());
            depositRequest.setUserId(requestDto.getUserId());
            depositRequest.setAmount(depositAmount);
            depositRequest.setPaymentMethod("wallet");
            
            PaymentResponseDto depositPayment = paymentServiceClient.processDeposit(depositRequest);
            
            if (depositPayment != null && depositPayment.getPaymentStatus() != null) {
                PaymentResponseDto.PaymentStatus status = depositPayment.getPaymentStatus();
                if (status == PaymentResponseDto.PaymentStatus.completed) {
                    // Deposit successful - confirm reservation
                    saved.setDepositPaymentId(depositPayment.getPaymentId());
                    saved.setStatus(Reservation.ReservationStatus.confirmed);
                    log.info("Deposit processed successfully. Payment ID: {}", depositPayment.getPaymentId());
                } else {
                    // Deposit failed - keep as pending
                    log.warn("Deposit payment failed for reservation {}. Status: {}", saved.getReservationId(), status);
                    throw new IllegalStateException("Deposit payment failed with status: " + status);
                }
            } else {
                log.warn("Deposit payment returned null or no status for reservation {}", saved.getReservationId());
                throw new IllegalStateException("Deposit payment failed. Please check your wallet balance.");
            }
        } catch (Exception e) {
            log.error("Error processing deposit for reservation {}: {}", saved.getReservationId(), e.getMessage(), e);
            throw new IllegalStateException("Failed to process deposit: " + e.getMessage());
        }
        
        saved = reservationRepository.save(saved);
        log.info("Reservation confirmed with deposit: {}", saved.getReservationId());

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
        return convertToDto(saved);
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
            (reservation.getDepositRefunded() == null || !reservation.getDepositRefunded())) {
            
            try {
                // Call payment service to refund deposit
                com.chargingservice.dtos.internal.RefundDepositRequestDto refundRequest = 
                    new com.chargingservice.dtos.internal.RefundDepositRequestDto();
                refundRequest.setReservationId(reservationId);
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
            // Lấy danh sách chargers từ station-service
            List<Map<String, Object>> chargers = stationServiceClient.getChargersByStationId(stationId);
            
            if (chargers == null || chargers.isEmpty()) {
                log.warn("No chargers found at station {}", stationId);
                return null;
            }

            List<Reservation.ReservationStatus> blockingStatuses = Arrays.asList(
                    Reservation.ReservationStatus.pending,
                    Reservation.ReservationStatus.confirmed,
                    Reservation.ReservationStatus.active
            );

            // Tìm charger available (status = available hoặc reserved) và không có overlap
            for (Map<String, Object> charger : chargers) {
                Long chargerId = getLongValue(charger, "chargerId");
                String status = (String) charger.get("status");
                
                // Chỉ xét chargers có status available hoặc reserved
                if (chargerId != null && (status == null || "available".equals(status) || "reserved".equals(status))) {
                    // Kiểm tra không có active charging session
                    boolean hasActiveSession = chargingSessionRepository
                            .findFirstByChargerIdAndSessionStatus(chargerId, ChargingSession.SessionStatus.charging)
                            .isPresent();
                    
                    if (hasActiveSession) {
                        continue;
                    }

                    // Kiểm tra không có overlapping reservations
                    List<Reservation> overlaps = reservationRepository.findOverlappingReservations(
                            chargerId, startTime, endTime, blockingStatuses
                    );
                    
                    if (overlaps.isEmpty()) {
                        log.info("Found available charger {} at station {}", chargerId, stationId);
                        return chargerId;
                    }
                }
            }
            
            log.warn("No available charger found at station {} for time slot {} - {}", stationId, startTime, endTime);
            return null;
        } catch (Exception e) {
            log.error("Error finding available charger at station {}: {}", stationId, e.getMessage(), e);
            return null;
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

