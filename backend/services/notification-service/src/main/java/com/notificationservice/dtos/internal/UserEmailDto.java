// FILE: UserEmailDto.java (in notification-service)
package com.notificationservice.dtos.internal;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserEmailDto {
    private Long userId;
    private String email;
}