package com.quitsmoking.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WebSocketMessageResponse {
    private String id;
    private String sessionId;
    private String senderId;
    private String content;
    private String messageType;
    private String senderName;
    private String senderUsername;
    private LocalDateTime timestamp;
} 