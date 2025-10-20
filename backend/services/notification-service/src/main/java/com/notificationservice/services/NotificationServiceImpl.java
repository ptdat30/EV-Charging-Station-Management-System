// ===============================================================
// FILE: NotificationServiceImpl.java (Updated to send email)
// PACKAGE: com.notificationservice.services
// ===============================================================
package com.notificationservice.services;

import com.notificationservice.dtos.CreateNotificationRequestDto;
import com.notificationservice.dtos.NotificationResponseDto;
import com.notificationservice.entities.Notification;
import com.notificationservice.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment; // Import Environment
import org.springframework.mail.SimpleMailMessage; // Import Mail classes
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor // Automatically creates constructor for final fields
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);
    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender; // Inject Mail Sender
    private final Environment environment; // Inject Environment to read config properties

    // TODO: Inject UserServiceClient later to fetch real user emails
    // private final UserServiceClient userServiceClient;

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
        sendEmailNotification(savedNotification); // Call the email sending method

        return convertToDto(savedNotification);
    }

    // --- Helper method to convert Entity to DTO ---
    private NotificationResponseDto convertToDto(Notification notification) {
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

    /**
     * Sends the notification via Email.
     * @param notification The notification details to send.
     */
    private void sendEmailNotification(Notification notification) {
        // Get the 'From' email address from configuration
        String fromEmail = environment.getProperty("spring.mail.username");
        if (fromEmail == null || fromEmail.isBlank()) {
            log.error("Email 'From' address is not configured (spring.mail.username). Cannot send email for notification {}.", notification.getNotificationId());
            return;
        }

        // --- Get Recipient Email ('To') ---
        // TODO: Replace this hardcoded email by calling UserServiceClient to get the actual user's email based on notification.getUserId()
        String toEmail = "your-real-test-email@example.com"; // <-- IMPORTANT: REPLACE WITH YOUR ACTUAL TEST EMAIL ADDRESS
        if (toEmail == null || toEmail.isBlank()) {
            log.error("Could not determine recipient email for user ID {}. Cannot send email for notification {}.", notification.getUserId(), notification.getNotificationId());
            return;
        }
        // --- End Recipient Email ---


        log.info("Attempting to send email notification {} from {} to {}", notification.getNotificationId(), fromEmail, toEmail);

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(toEmail);
            mailMessage.setSubject(notification.getTitle());
            mailMessage.setText(notification.getMessage());

            mailSender.send(mailMessage);
            log.info("Email sent successfully for notification {}", notification.getNotificationId());

            // Optional: Update notification status in DB (e.g., add an 'email_sent_at' timestamp)

        } catch (Exception e) {
            log.error("Failed to send email for notification {}: {}", notification.getNotificationId(), e.getMessage(), e);
            // Optional: Implement retry logic or dead-letter queue for failed emails
        }
    }
}