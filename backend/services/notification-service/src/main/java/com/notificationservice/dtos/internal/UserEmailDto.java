// FILE: UserEmailDto.java (in notification-service)
package com.notificationservice.dtos.internal;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for user information from user-service
 * Used for sending notifications
 */
@Data
@NoArgsConstructor
public class UserEmailDto {
    private Long userId;
    private String email;
    private String role; // ADMIN, DRIVER, STAFF
    private String userType; // Alternative field for user type
}