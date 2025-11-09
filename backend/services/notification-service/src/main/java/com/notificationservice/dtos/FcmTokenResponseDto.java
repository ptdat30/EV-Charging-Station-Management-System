package com.notificationservice.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FcmTokenResponseDto {
    private Long fcmTokenId;
    private Long userId;
    private String deviceType;
    private String deviceId;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime lastUsedAt;
}

