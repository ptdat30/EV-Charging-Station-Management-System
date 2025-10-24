// ===============================================================
// FILE: NotificationServiceImpl.java (Updated to fetch user email)
// PACKAGE: com.notificationservice.services
// ===============================================================
package com.notificationservice.services;

import com.notificationservice.clients.UserServiceClient; // Import User Service Client
import com.notificationservice.dtos.CreateNotificationRequestDto;
import com.notificationservice.dtos.NotificationResponseDto;
import com.notificationservice.dtos.internal.UserEmailDto; // Import User Email DTO
import com.notificationservice.entities.Notification;
import com.notificationservice.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);
    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;
    private final Environment environment;
    private final UserServiceClient userServiceClient; // Inject User Service Client

    @Override
    public NotificationResponseDto createNotification(CreateNotificationRequestDto requestDto) {
        log.info("Creating notification for user {}: {}", requestDto.getUserId(), requestDto.getTitle());

        Notification notification = new Notification();
        notification.setUserId(requestDto.getUserId());
        notification.setNotificationType(requestDto.getNotificationType());
        notification.setTitle(requestDto.getTitle());
        notification.setMessage(requestDto.getMessage());
        notification.setReferenceId(requestDto.getReferenceId());
        notification.setIsRead(false);

        Notification savedNotification = notificationRepository.save(notification);
        log.info("Notification {} created successfully.", savedNotification.getNotificationId());

        // --- Activate Email Sending ---
        sendEmailNotification(savedNotification);

        return convertToDto(savedNotification);
    }

    private NotificationResponseDto convertToDto(Notification notification) {
        // ... (this method remains the same) ...
        NotificationResponseDto dto = new NotificationResponseDto();
        dto.setNotificationId(notification.getNotificationId());
        dto.setUserId(notification.getUserId());
        dto.setNotificationType(notification.getNotificationType());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setReferenceId(notification.getReferenceId());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }

    private void sendEmailNotification(Notification notification) {
        String fromEmail = environment.getProperty("spring.mail.username");
        if (fromEmail == null || fromEmail.isBlank()) {
            log.error("Email 'From' address not configured. Cannot send email for notification {}.", notification.getNotificationId());
            return;
        }

        // --- Get Recipient Email ('To') using Feign Client ---
        String toEmail = null;
        try {
            log.debug("Fetching email for userId {}", notification.getUserId());
            // Call user-service via Feign to get user details including email
            UserEmailDto userDetails = userServiceClient.getUserById(notification.getUserId());
            if (userDetails != null && userDetails.getEmail() != null) {
                toEmail = userDetails.getEmail();
                log.debug("Found email {} for userId {}", toEmail, notification.getUserId());
            } else {
                log.error("Could not retrieve email for userId {} from user-service.", notification.getUserId());
            }
        } catch (Exception e) {
            log.error("Failed to fetch email for userId {} from user-service. Error: {}", notification.getUserId(), e.getMessage());
        }
        // --- End Recipient Email ---

        if (toEmail == null || toEmail.isBlank()) {
            log.error("Recipient email is missing. Cannot send email for notification {}.", notification.getNotificationId());
            return; // Stop if we don't have a recipient
        }

        log.info("Attempting to send email notification {} from {} to {}", notification.getNotificationId(), fromEmail, toEmail);

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(toEmail);
            mailMessage.setSubject(notification.getTitle());
            mailMessage.setText(notification.getMessage());

            mailSender.send(mailMessage);
            log.info("Email sent successfully for notification {}", notification.getNotificationId());

        } catch (Exception e) {
            log.error("Failed to send email for notification {}: {}", notification.getNotificationId(), e.getMessage(), e);
        }
    }
}