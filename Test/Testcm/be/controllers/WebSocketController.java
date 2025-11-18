package com.quitsmoking.controllers;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.beans.factory.annotation.Autowired;
import com.quitsmoking.dto.request.WebSocketMessageRequest;
import com.quitsmoking.dto.response.WebSocketMessageResponse;
import com.quitsmoking.services.UserStatusService;
import com.quitsmoking.services.ChatMessageService;
import com.quitsmoking.services.EncryptionService;
import com.quitsmoking.model.ChatMessage;
import java.time.LocalDateTime;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Controller
public class WebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketController.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private UserStatusService userStatusService;
    
    @Autowired
    private ChatMessageService chatMessageService;
    
    @Autowired
    private EncryptionService encryptionService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload WebSocketMessageRequest chatMessage) {
        logger.debug("WebSocketController: Received message from {}", chatMessage.getSenderId());
        
        // Save message to database
        try {
            ChatMessage savedMessage = chatMessageService.saveMessageFromWebSocket(chatMessage);
            
            // Create response
            WebSocketMessageResponse response = new WebSocketMessageResponse();
            response.setId(savedMessage.getId());
            response.setSessionId(savedMessage.getConsultation().getId());
            response.setSenderId(savedMessage.getSender().getId());
            
            // Decrypt content before sending response
            String decryptedContent = savedMessage.getContent();
            if (encryptionService.isEncrypted(decryptedContent)) {
                try {
                    decryptedContent = encryptionService.decrypt(decryptedContent);
                } catch (Exception e) {
                    logger.error("WebSocketController: Error decrypting message content: {}", e.getMessage());
                    decryptedContent = savedMessage.getContent(); // Fallback to encrypted content
                }
            }
            response.setContent(decryptedContent);
            
            response.setMessageType(savedMessage.getMessageType().name());
            response.setSenderName(chatMessage.getSenderName());
            response.setSenderUsername(chatMessage.getSenderUsername());
            response.setTimestamp(savedMessage.getTimestamp());
            
            // Send to specific session topic
            String topicDestination = "/topic/session." + chatMessage.getSessionId();
            logger.info("WebSocketController: Sending message to topic: {}", topicDestination);
            messagingTemplate.convertAndSend(topicDestination, response);
            logger.info("WebSocketController: Message sent successfully to topic: {}", topicDestination);
            
            // Send to global topic for coaches to receive notifications
            String globalTopicDestination = "/topic/global-messages";
            logger.info("WebSocketController: Sending message to global topic: {}", globalTopicDestination);
            messagingTemplate.convertAndSend(globalTopicDestination, response);
            logger.info("WebSocketController: Message sent successfully to global topic: {}", globalTopicDestination);
        } catch (Exception e) {
            logger.error("WebSocketController: Error saving message: {}", e.getMessage());
            
            // Return basic response if save fails
            WebSocketMessageResponse response = new WebSocketMessageResponse();
            response.setId(UUID.randomUUID().toString());
            response.setSessionId(chatMessage.getSessionId());
            response.setSenderId(chatMessage.getSenderId());
            response.setContent(chatMessage.getContent());
            response.setMessageType(chatMessage.getMessageType());
            response.setSenderName(chatMessage.getSenderName());
            response.setSenderUsername(chatMessage.getSenderUsername());
            response.setTimestamp(LocalDateTime.now());
            
            // Send to specific session topic
            String topicDestination = "/topic/session." + chatMessage.getSessionId();
            logger.info("WebSocketController: Sending message to topic: {}", topicDestination);
            messagingTemplate.convertAndSend(topicDestination, response);
            logger.info("WebSocketController: Message sent successfully to topic: {}", topicDestination);
            
            // Send to global topic for coaches to receive notifications
            String globalTopicDestination = "/topic/global-messages";
            logger.info("WebSocketController: Sending message to global topic: {}", globalTopicDestination);
            messagingTemplate.convertAndSend(globalTopicDestination, response);
            logger.info("WebSocketController: Message sent successfully to global topic: {}", globalTopicDestination);
        }
    }

    @MessageMapping("/chat.addUser")
    public void addUser(@Payload WebSocketMessageRequest chatMessage, 
                       SimpMessageHeaderAccessor headerAccessor) {
        logger.info("WebSocketController: User joining - {}", chatMessage.getSenderId());
        
        // Add username to web socket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSenderUsername());
        headerAccessor.getSessionAttributes().put("userId", chatMessage.getSenderId());
        headerAccessor.getSessionAttributes().put("sessionId", chatMessage.getSessionId());
        
        // Update user status
        userStatusService.userConnected(chatMessage.getSenderId());
        
        logger.info("WebSocketController: User joined session without sending join message");
    }
    
    @MessageMapping("/chat.heartbeat")
    public void handleHeartbeat(@Payload WebSocketMessageRequest heartbeatMessage) {
        logger.debug("WebSocketController: Heartbeat from {}", heartbeatMessage.getSenderId());
        userStatusService.userHeartbeat(heartbeatMessage.getSenderId());
    }
    
    @MessageMapping("/user.heartbeat")
    public void handleUserHeartbeat(@Payload WebSocketMessageRequest heartbeatMessage) {
        logger.debug("WebSocketController: User Heartbeat from {}", heartbeatMessage.getSenderId());
        userStatusService.userHeartbeat(heartbeatMessage.getSenderId());
    }
    
    @MessageMapping("/chat.private")
    public void sendPrivateMessage(@Payload WebSocketMessageRequest chatMessage) {
        logger.debug("WebSocketController: Private message from {}", chatMessage.getSenderId());
        
        // Save message to database
        try {
            ChatMessage savedMessage = chatMessageService.saveMessageFromWebSocket(chatMessage);
            
            // Create response
            WebSocketMessageResponse response = new WebSocketMessageResponse();
            response.setId(savedMessage.getId());
            response.setSessionId(savedMessage.getConsultation().getId());
            response.setSenderId(savedMessage.getSender().getId());
            
            // Decrypt content before sending response
            String decryptedContent = savedMessage.getContent();
            if (encryptionService.isEncrypted(decryptedContent)) {
                try {
                    decryptedContent = encryptionService.decrypt(decryptedContent);
                } catch (Exception e) {
                    logger.error("WebSocketController: Error decrypting private message content: {}", e.getMessage());
                    decryptedContent = savedMessage.getContent(); // Fallback to encrypted content
                }
            }
            response.setContent(decryptedContent);
            
            response.setMessageType(savedMessage.getMessageType().name());
            response.setSenderName(chatMessage.getSenderName());
            response.setSenderUsername(chatMessage.getSenderUsername());
            response.setTimestamp(savedMessage.getTimestamp());
            
            // Send to specific user (assuming recipientId is in sessionId for private messages)
            messagingTemplate.convertAndSendToUser(
                chatMessage.getSessionId(), // Using sessionId as recipientId for private messages
                "/queue/private",
                response
            );
        } catch (Exception e) {
            logger.error("WebSocketController: Error saving private message: {}", e.getMessage());
        }
    }
} 