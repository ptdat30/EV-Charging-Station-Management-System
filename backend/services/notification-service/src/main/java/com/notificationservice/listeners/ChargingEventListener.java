// FILE: ChargingEventListener.java (trong notification-service)
package com.notificationservice.listeners;

import com.notificationservice.dtos.CreateNotificationRequestDto;
import com.notificationservice.events.dtos.SessionStartedEvent;
import com.notificationservice.services.NotificationService;
import com.notificationservice.entities.Notification; // Import enum
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ChargingEventListener {

    private static final Logger log = LoggerFactory.getLogger(ChargingEventListener.class);

    @Autowired
    private NotificationService notificationService; // Inject service để tạo thông báo

    // [COMMAND]: Lắng nghe message từ queue có tên trong ${app.rabbitmq.queue}
    @RabbitListener(queues = "${app.rabbitmq.queue}")
    public void handleSessionStarted(SessionStartedEvent event) {
        log.info("Received SessionStartedEvent for session {}", event.getSessionId());

        try {
            // Tạo request DTO để gọi NotificationService
            CreateNotificationRequestDto notificationDto = new CreateNotificationRequestDto();
            notificationDto.setUserId(event.getUserId());
            notificationDto.setNotificationType(Notification.NotificationType.charging_started);
            notificationDto.setTitle("Charging Started");
            notificationDto.setMessage("Your charging session (ID: " + event.getSessionId() + ") started at " + event.getStartTime());
            notificationDto.setReferenceId(event.getSessionId());

            // Gọi service để tạo và gửi thông báo
            notificationService.createNotification(notificationDto);

            log.info("Notification created successfully for SessionStartedEvent {}", event.getSessionId());
            // Message sẽ tự động được Acknowledge (ack) nếu không có exception xảy ra
        } catch (Exception e) {
            log.error("Error processing SessionStartedEvent for session {}: {}", event.getSessionId(), e.getMessage(), e);
            // Nếu có lỗi, message sẽ không được ack và RabbitMQ có thể thử gửi lại (tùy cấu hình)
            // Cần có cơ chế xử lý lỗi (ví dụ: Dead Letter Queue)
        }
    }

    // Sau này sẽ thêm các phương thức @RabbitListener khác để xử lý SessionStoppedEvent, PaymentCompletedEvent,...
}