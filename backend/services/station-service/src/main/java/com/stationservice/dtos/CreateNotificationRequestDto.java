// FILE: CreateNotificationRequestDto.java
package com.stationservice.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating notifications
 * Used to communicate with notification-service
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateNotificationRequestDto {
    private Long userId; // null = send to all admins
    private NotificationType notificationType;
    private String title;
    private String message;
    private Long referenceId; // e.g., incidentId

    /**
     * Notification types - must match notification-service enum
     */
    public enum NotificationType {
        charging_started, charging_complete, charging_failed,
        reservation_confirmed, reservation_reminder, reservation_cancelled,
        payment_success, payment_failed, wallet_low_balance,
        promotion, system_maintenance, station_offline,
        review_request, account_update, incident_reported
    }
}

