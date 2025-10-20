// FILE: NotificationController.java
package com.notificationservice.controllers;

import com.notificationservice.dtos.CreateNotificationRequestDto;
import com.notificationservice.dtos.NotificationResponseDto;
import com.notificationservice.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // POST /api/notifications
    @PostMapping
    public ResponseEntity<NotificationResponseDto> createNotification(@RequestBody CreateNotificationRequestDto requestDto) {
        NotificationResponseDto createdNotification = notificationService.createNotification(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNotification);
    }

    // {
    //  "userId": 1,
    //  "notificationType": "charging_started",
    //  "title": "Charging Started",
    //  "message": "Your charging session for session ID 123 has started.",
    //  "referenceId": 123
    //}
}