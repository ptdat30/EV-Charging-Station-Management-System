package com.quitsmoking.dto.request;

import lombok.Data;

@Data
public class WebSocketMessageRequest {
    private String sessionId;
    private String senderId;
    private String content;
    private String messageType;
    private String senderName;
    private String senderUsername;
    private String recipientId;
} 