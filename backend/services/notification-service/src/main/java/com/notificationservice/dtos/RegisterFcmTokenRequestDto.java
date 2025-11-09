package com.notificationservice.dtos;

import lombok.Data;

@Data
public class RegisterFcmTokenRequestDto {
    private String token; // FCM token from device
    private String deviceType; // ANDROID, IOS, WEB
    private String deviceId; // Unique device identifier
}

