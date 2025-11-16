package com.chargingservice.schedulers;

import com.chargingservice.clients.NotificationServiceClient;
import com.chargingservice.clients.StationServiceClient;
import com.chargingservice.dtos.internal.CreateNotificationRequestDto;
import com.chargingservice.dtos.internal.UpdateChargerStatusDto;
import com.chargingservice.entities.ChargingSession;
import com.chargingservice.entities.Reservation;
import com.chargingservice.repositories.ChargingSessionRepository;
import com.chargingservice.repositories.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled task to cleanup stale charging sessions:
 * 1. Auto-complete sessions that have been charging for too long (>12 hours)
 */
@Component
@RequiredArgsConstructor
public class SessionCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(SessionCleanupScheduler.class);
    
    private final ChargingSessionRepository sessionRepository;
    private final ReservationRepository reservationRepository;
    private final StationServiceClient stationServiceClient;
    private final NotificationServiceClient notificationServiceClient;

    /**
     * Cleanup stale charging sessions (running for more than 12 hours)
     * Runs every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour = 3,600,000 ms
    @Transactional
    public void cleanupStaleSessions() {
        log.debug("Checking for stale charging sessions...");
        
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(12); // Sessions started more than 12 hours ago
        
        // Find sessions that are still charging but started more than 12 hours ago
        List<ChargingSession> staleSessions = sessionRepository.findAll().stream()
                .filter(s -> s.getSessionStatus() == ChargingSession.SessionStatus.charging)
                .filter(s -> s.getStartTime() != null && s.getStartTime().isBefore(cutoffTime))
                .toList();
        
        for (ChargingSession session : staleSessions) {
            try {
                processStaleSession(session);
                log.info("Processed stale session {} (started at {}, duration: {} hours)", 
                        session.getSessionId(), 
                        session.getStartTime(),
                        Duration.between(session.getStartTime(), LocalDateTime.now()).toHours());
            } catch (Exception e) {
                log.error("Failed to process stale session {}: {}", 
                        session.getSessionId(), e.getMessage(), e);
            }
        }
        
        if (!staleSessions.isEmpty()) {
            log.info("Processed {} stale charging sessions", staleSessions.size());
        }
    }

    private void processStaleSession(ChargingSession session) {
        LocalDateTime now = LocalDateTime.now();
        
        // Mark session as completed
        session.setEndTime(now);
        session.setSessionStatus(ChargingSession.SessionStatus.completed);
        
        // Calculate energy consumed (max at 12 hours worth)
        long durationInMinutes = Duration.between(session.getStartTime(), now).toMinutes();
        if (durationInMinutes <= 0) durationInMinutes = 1;
        
        // Cap at 12 hours for calculation (12 * 60 = 720 minutes)
        long cappedMinutes = Math.min(durationInMinutes, 720);
        double energy = cappedMinutes * 0.6; // 0.6 kWh/phút
        session.setEnergyConsumed(BigDecimal.valueOf(energy).setScale(2, RoundingMode.HALF_UP));
        
        sessionRepository.save(session);
        
        // Cập nhật reservation status từ "active" sang "completed" nếu có
        reservationRepository.findBySessionId(session.getSessionId()).ifPresent(reservation -> {
            if (reservation.getStatus() == Reservation.ReservationStatus.active) {
                reservation.setStatus(Reservation.ReservationStatus.completed);
                reservationRepository.save(reservation);
                log.info("Updated reservation {} status from active to completed for stale session {}", 
                        reservation.getReservationId(), session.getSessionId());
            }
        });
        
        // Update charger status to available
        try {
            UpdateChargerStatusDto updateStatus = new UpdateChargerStatusDto();
            updateStatus.setStatus(UpdateChargerStatusDto.ChargerStatus.available);
            stationServiceClient.updateChargerStatus(session.getChargerId(), updateStatus);
            log.info("Updated charger {} status to available", session.getChargerId());
        } catch (Exception e) {
            log.error("Failed to update charger status for session {}: {}", 
                    session.getSessionId(), e.getMessage());
        }
        
        // Send notification
        try {
            CreateNotificationRequestDto notification = new CreateNotificationRequestDto();
            notification.setUserId(session.getUserId());
            notification.setNotificationType(CreateNotificationRequestDto.NotificationType.charging_complete);
            notification.setTitle("Phiên sạc đã tự động hoàn thành");
            notification.setMessage(String.format(
                    "Phiên sạc (ID: %d) đã tự động hoàn thành sau 12 giờ. " +
                    "Năng lượng đã sạc: %.2f kWh. Vui lòng thanh toán.",
                    session.getSessionId(), 
                    session.getEnergyConsumed().doubleValue()));
            notification.setReferenceId(session.getSessionId());
            
            notificationServiceClient.createNotification(notification);
        } catch (Exception e) {
            log.error("Error sending notification for stale session {}: {}", 
                    session.getSessionId(), e.getMessage());
        }
    }
}

