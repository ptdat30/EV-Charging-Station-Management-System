package com.chargingservice.schedulers;

import com.chargingservice.clients.NotificationServiceClient;
import com.chargingservice.dtos.internal.CreateNotificationRequestDto;
import com.chargingservice.entities.Reservation;
import com.chargingservice.repositories.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled tasks for reservation management:
 * 1. Send reminder notifications 30-60 minutes before reservation time
 * 2. Process no-show reservations (expired check-in deadline)
 */
@Component
@RequiredArgsConstructor
public class ReservationScheduler {

    private static final Logger log = LoggerFactory.getLogger(ReservationScheduler.class);
    
    private final ReservationRepository reservationRepository;
    private final NotificationServiceClient notificationServiceClient;

    /**
     * Send reminder notifications for upcoming reservations
     * Runs every 5 minutes
     */
    @Scheduled(fixedRate = 300000) // 5 minutes = 300,000 ms
    @Transactional
    public void sendReservationReminders() {
        log.debug("Checking for reservations needing reminders...");
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderWindowStart = now.plusMinutes(30); // 30 minutes from now
        LocalDateTime reminderWindowEnd = now.plusHours(1); // 1 hour from now
        
        // Find confirmed reservations starting between 30 minutes and 1 hour from now
        List<Reservation> upcomingReservations = reservationRepository
                .findByReservedStartTimeBetweenAndStatusAndReminderNotSent(
                        reminderWindowStart, reminderWindowEnd,
                        Reservation.ReservationStatus.confirmed);
        
        for (Reservation reservation : upcomingReservations) {
            try {
                sendReminderNotification(reservation);
                reservation.setReminderSent(true);
                reservation.setReminderSentAt(now);
                reservationRepository.save(reservation);
                log.info("Reminder sent for reservation {} (user {}, starts at {})", 
                        reservation.getReservationId(), 
                        reservation.getUserId(), 
                        reservation.getReservedStartTime());
            } catch (Exception e) {
                log.error("Failed to send reminder for reservation {}: {}", 
                        reservation.getReservationId(), e.getMessage(), e);
            }
        }
        
        if (!upcomingReservations.isEmpty()) {
            log.info("Sent {} reservation reminders", upcomingReservations.size());
        }
    }

    /**
     * Process no-show reservations
     * Runs every minute
     */
    @Scheduled(fixedRate = 60000) // 1 minute = 60,000 ms
    @Transactional
    public void processNoShows() {
        log.debug("Checking for no-show reservations...");
        
        LocalDateTime deadline = LocalDateTime.now().minusMinutes(15); // 15 minutes after reservedStartTime
        
        // Find confirmed reservations that passed check-in deadline and not checked in
        List<Reservation> expiredReservations = reservationRepository
                .findByStatusAndReservedStartTimeBeforeAndNotCheckedIn(
                        Reservation.ReservationStatus.confirmed, deadline);
        
        for (Reservation reservation : expiredReservations) {
            try {
                processNoShow(reservation);
                log.info("Processed no-show for reservation {} (user {}, deadline: {})", 
                        reservation.getReservationId(), 
                        reservation.getUserId(), 
                        reservation.getCheckInDeadline());
            } catch (Exception e) {
                log.error("Failed to process no-show for reservation {}: {}", 
                        reservation.getReservationId(), e.getMessage(), e);
            }
        }
        
        if (!expiredReservations.isEmpty()) {
            log.info("Processed {} no-show reservations", expiredReservations.size());
        }
    }

    private void sendReminderNotification(Reservation reservation) {
        try {
            CreateNotificationRequestDto notification = new CreateNotificationRequestDto();
            notification.setUserId(reservation.getUserId());
            notification.setNotificationType(CreateNotificationRequestDto.NotificationType.reservation_reminder);
            notification.setTitle("Nhắc nhở đặt chỗ sạc");
            
            long minutesUntilStart = java.time.Duration.between(
                    LocalDateTime.now(), reservation.getReservedStartTime()).toMinutes();
            
            notification.setMessage(String.format(
                    "Bạn có đặt chỗ sạc tại trạm ID %d trong %d phút nữa (lúc %s). " +
                    "Vui lòng đến đúng giờ và check-in trong vòng 15 phút sau thời gian đặt để nhận lại tiền cọc.",
                    reservation.getStationId(),
                    minutesUntilStart,
                    reservation.getReservedStartTime().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy"))));
            notification.setReferenceId(reservation.getReservationId());
            
            notificationServiceClient.createNotification(notification);
        } catch (Exception e) {
            log.error("Error sending reminder notification: {}", e.getMessage(), e);
            throw e;
        }
    }

    private void processNoShow(Reservation reservation) {
        // Mark as no-show
        reservation.setStatus(Reservation.ReservationStatus.no_show);
        reservation.setNoShowCount((reservation.getNoShowCount() != null ? reservation.getNoShowCount() : 0) + 1);
        reservation.setNoShowPenaltyApplied(true);
        
        // Keep deposit - don't refund
        // Deposit will remain with the system
        
        reservationRepository.save(reservation);
        
        // Send notification about no-show
        try {
            CreateNotificationRequestDto notification = new CreateNotificationRequestDto();
            notification.setUserId(reservation.getUserId());
            notification.setNotificationType(CreateNotificationRequestDto.NotificationType.reservation_cancelled);
            notification.setTitle("Đặt chỗ bị hủy - Không điểm danh");
            notification.setMessage(String.format(
                    "Đặt chỗ ID %d đã bị hủy do không check-in đúng hạn. " +
                    "Tiền cọc %s VND sẽ không được hoàn lại. " +
                    "Số lần không đến: %d. Nếu tích lũy nhiều lần, bạn có thể bị hạn chế quyền đặt trước.",
                    reservation.getReservationId(),
                    reservation.getDepositAmount() != null ? reservation.getDepositAmount().toString() : "0",
                    reservation.getNoShowCount()));
            notification.setReferenceId(reservation.getReservationId());
            
            notificationServiceClient.createNotification(notification);
        } catch (Exception e) {
            log.error("Error sending no-show notification: {}", e.getMessage(), e);
            // Don't fail the process if notification fails
        }
    }
}

