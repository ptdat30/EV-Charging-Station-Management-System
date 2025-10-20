// ===============================================================
// FILE: CreateNotificationRequestDto.java
// LOCATION: payment-service/src/main/java/com/paymentservice/dtos/internal/CreateNotificationRequestDto.java
// ===============================================================
package com.paymentservice.dtos.internal; // Ensure this package declaration is correct

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateNotificationRequestDto {
    private Long userId;
    private NotificationType notificationType;
    private String title;
    private String message;
    private Long referenceId; // e.g., paymentId or sessionId

    // Enum must match NotificationType in notification-service
    // Make sure all necessary types are included here
    public enum NotificationType {
        charging_started, charging_complete, charging_failed,
        reservation_confirmed, reservation_reminder, reservation_cancelled,
        payment_success, payment_failed, wallet_low_balance,
        promotion, system_maintenance, station_offline,
        review_request, account_update
    }
}