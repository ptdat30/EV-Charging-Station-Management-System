// FILE: NotificationServiceImpl.java
package com.notificationservice.services;

import com.notificationservice.dtos.CreateNotificationRequestDto;
import com.notificationservice.dtos.NotificationResponseDto;
import com.notificationservice.entities.Notification;
import com.notificationservice.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);
    private final NotificationRepository notificationRepository;
    // private final JavaMailSender mailSender; // Sẽ inject sau khi cần gửi mail

    @Override
    public NotificationResponseDto createNotification(CreateNotificationRequestDto requestDto) {
        log.info("Creating notification for user {}: {}", requestDto.getUserId(), requestDto.getTitle());

        Notification notification = new Notification();
        notification.setUserId(requestDto.getUserId());
        notification.setNotificationType(requestDto.getNotificationType());
        notification.setTitle(requestDto.getTitle());
        notification.setMessage(requestDto.getMessage());
        notification.setReferenceId(requestDto.getReferenceId());
        notification.setIsRead(false); // Mặc định là chưa đọc

        Notification savedNotification = notificationRepository.save(notification);
        log.info("Notification {} created successfully.", savedNotification.getNotificationId());

        // TO-DO: Kích hoạt logic gửi thông báo (email, push, sms) ở đây
        // sendEmailNotification(savedNotification); // Ví dụ

        return convertToDto(savedNotification);
    }

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

    // Ví dụ phương thức gửi email (sẽ hoàn thiện sau)
    /*
    private void sendEmailNotification(Notification notification) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            // Lấy email người dùng từ user-service (dùng FeignClient)
            // String userEmail = userServiceClient.getUserEmail(notification.getUserId());
            // mailMessage.setTo(userEmail);
            mailMessage.setSubject(notification.getTitle());
            mailMessage.setText(notification.getMessage());
            mailSender.send(mailMessage);
            log.info("Email sent successfully for notification {}", notification.getNotificationId());
        } catch (Exception e) {
            log.error("Failed to send email for notification {}: {}", notification.getNotificationId(), e.getMessage());
        }
    }
    */
}