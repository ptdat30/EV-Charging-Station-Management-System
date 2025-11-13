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
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.mail.internet.MimeMessage;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);
    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;
    private final Environment environment;
    private final UserServiceClient userServiceClient; // Inject User Service Client
    private final FirebaseMessagingService firebaseMessagingService;
    private final FcmTokenService fcmTokenService;
    private final EmailTemplateService emailTemplateService; // Inject Email Template Service

    @Override
    public NotificationResponseDto createNotification(CreateNotificationRequestDto requestDto) {
        log.info("Creating notification for user {}: {}", requestDto.getUserId(), requestDto.getTitle());

        // Special case: userId == null means send to all admins
        if (requestDto.getUserId() == null) {
            return createNotificationForAllAdmins(requestDto);
        }

        Notification notification = new Notification();
        notification.setUserId(requestDto.getUserId());
        notification.setNotificationType(requestDto.getNotificationType());
        notification.setTitle(requestDto.getTitle());
        notification.setMessage(requestDto.getMessage());
        notification.setReferenceId(requestDto.getReferenceId());
        notification.setIsRead(false);

        Notification savedNotification = notificationRepository.save(notification);
        log.info("Notification {} created successfully.", savedNotification.getNotificationId());

        // --- Send Email Notification ---
        sendEmailNotification(savedNotification);

        // --- Send Firebase Push Notification ---
        sendPushNotification(savedNotification);

        return convertToDto(savedNotification);
    }

    /**
     * Create notification for all admin users
     * Used for system-wide alerts like incident reports
     */
    private NotificationResponseDto createNotificationForAllAdmins(CreateNotificationRequestDto requestDto) {
        log.info("Creating notification for all admins: {}", requestDto.getTitle());
        
        try {
            // Fetch all admin users from user-service
            List<UserEmailDto> allUsers = userServiceClient.getAllUsers();
            List<Long> adminUserIds = allUsers.stream()
                .filter(user -> "ADMIN".equalsIgnoreCase(user.getRole()) || 
                               "admin".equalsIgnoreCase(user.getUserType()))
                .map(UserEmailDto::getUserId)
                .toList();
            
            log.info("Found {} admin users to notify", adminUserIds.size());
            
            // Create notification for each admin
            Notification firstNotification = null;
            for (Long adminId : adminUserIds) {
                Notification notification = new Notification();
                notification.setUserId(adminId);
                notification.setNotificationType(requestDto.getNotificationType());
                notification.setTitle(requestDto.getTitle());
                notification.setMessage(requestDto.getMessage());
                notification.setReferenceId(requestDto.getReferenceId());
                notification.setIsRead(false);
                
                Notification saved = notificationRepository.save(notification);
                if (firstNotification == null) {
                    firstNotification = saved;
                }
                
                // Send email and push notification
                sendEmailNotification(saved);
                sendPushNotification(saved);
            }
            
            // Return the first notification as response
            if (firstNotification != null) {
                return convertToDto(firstNotification);
            }
        } catch (Exception e) {
            log.error("Error creating notifications for admins: {}", e.getMessage(), e);
        }
        
        // Fallback: return a dummy response
        NotificationResponseDto dto = new NotificationResponseDto();
        dto.setNotificationId(0L);
        dto.setTitle(requestDto.getTitle());
        dto.setMessage(requestDto.getMessage());
        return dto;
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
        UserEmailDto userDetails = null;
        
        try {
            log.debug("Fetching email for userId {}", notification.getUserId());
            // Call user-service via Feign to get user details including email
            userDetails = userServiceClient.getUserById(notification.getUserId());
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
            // Get user name for personalization
            String userName = toEmail.split("@")[0]; // Default: use email prefix
            
            // Try to get full name from user details if available
            if (userDetails != null && userDetails.getEmail() != null) {
                userName = toEmail.split("@")[0]; // Use email prefix as fallback
                // TODO: If UserEmailDto has fullName field in future, use it:
                // userName = userDetails.getFullName() != null ? userDetails.getFullName() : userName;
            }
            
            // Generate professional HTML email using template service
            String htmlContent = emailTemplateService.generateEmailTemplate(notification, toEmail, userName);
            
            // Create MimeMessage for HTML email
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("⚡ " + notification.getTitle() + " - EV Charge Station");
            helper.setText(htmlContent, true); // true = HTML content
            
            mailSender.send(mimeMessage);
            log.info("✅ Professional HTML email sent successfully for notification {}", notification.getNotificationId());

        } catch (Exception e) {
            log.error("Failed to send email for notification {}: {}", notification.getNotificationId(), e.getMessage(), e);
        }
    }

    private void sendPushNotification(Notification notification) {
        try {
            // Get all active FCM tokens for the user
            java.util.List<String> fcmTokens = fcmTokenService.getActiveTokensForUser(notification.getUserId());

            if (fcmTokens.isEmpty()) {
                log.debug("No active FCM tokens found for user {}. Skipping push notification.", notification.getUserId());
                return;
            }

            // Prepare data payload
            java.util.Map<String, String> data = new java.util.HashMap<>();
            data.put("notificationId", notification.getNotificationId().toString());
            data.put("notificationType", notification.getNotificationType().toString());
            data.put("userId", notification.getUserId().toString());
            if (notification.getReferenceId() != null) {
                data.put("referenceId", notification.getReferenceId().toString());
            }

            // Send push notification to all user devices
            firebaseMessagingService.sendPushNotificationToMultipleTokens(
                    fcmTokens,
                    notification.getTitle(),
                    notification.getMessage(),
                    data
            );

            log.info("Push notification sent to {} device(s) for user {}", fcmTokens.size(), notification.getUserId());

        } catch (Exception e) {
            log.error("Failed to send push notification for notification {}: {}", notification.getNotificationId(), e.getMessage(), e);
        }
    }

    @Override
    public List<NotificationResponseDto> getNotificationsByUserId(Long userId) {
        log.info("Fetching notifications for user {}", userId);
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(this::convertToDto)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public NotificationResponseDto markAsRead(Long notificationId) {
        log.info("Marking notification {} as read", notificationId);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));
        
        notification.setIsRead(true);
        Notification updated = notificationRepository.save(notification);
        return convertToDto(updated);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        log.info("Marking all notifications as read for user {}", userId);
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Override
    public void deleteNotification(Long notificationId) {
        log.info("Deleting notification {}", notificationId);
        if (!notificationRepository.existsById(notificationId)) {
            throw new RuntimeException("Notification not found: " + notificationId);
        }
        notificationRepository.deleteById(notificationId);
    }

    @Override
    public Long getUnreadCount(Long userId) {
        log.debug("Getting unread count for user {}", userId);
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}