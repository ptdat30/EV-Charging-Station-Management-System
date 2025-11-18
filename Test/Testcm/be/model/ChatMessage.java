package com.quitsmoking.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
public class ChatMessage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "VARCHAR(36)")
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultation_id", nullable = false)
    private CoachConsultation consultation;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "message_type")
    private MessageType messageType = MessageType.TEXT;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @Column(name = "file_url", columnDefinition = "TEXT")
    private String fileUrl;
    
    @Column(name = "timestamp")
    private LocalDateTime timestamp = LocalDateTime.now();
    
    @Column(name = "is_read")
    private Boolean isRead = false;
    
    public enum MessageType {
        TEXT, IMAGE, FILE
    }

    public com.quitsmoking.dto.response.ChatMessageResponse toResponse() {
        com.quitsmoking.dto.response.ChatMessageResponse dto = new com.quitsmoking.dto.response.ChatMessageResponse();
        dto.setId(this.getId());
        dto.setConsultationId(this.getConsultation() != null ? this.getConsultation().getId() : null);
        dto.setSenderId(this.getSender() != null ? this.getSender().getId() : null);
        
        // Add sender information
        if (this.getSender() != null) {
            dto.setSenderFirstName(this.getSender().getFirstName());
            dto.setSenderLastName(this.getSender().getLastName());
            dto.setSenderUsername(this.getSender().getUsername());
            dto.setSenderRole(this.getSender().getRole() != null ? this.getSender().getRole().name() : null);
            
            // Set sender name (full name or username)
            if (this.getSender().getFirstName() != null && this.getSender().getLastName() != null) {
                dto.setSenderName(this.getSender().getFirstName() + " " + this.getSender().getLastName());
            } else if (this.getSender().getFirstName() != null) {
                dto.setSenderName(this.getSender().getFirstName());
            } else {
                dto.setSenderName(this.getSender().getUsername());
            }
        }
        
        // Content is already decrypted by ChatMessageService before calling toResponse()
        dto.setContent(this.getContent());
        dto.setMessageType(this.getMessageType() != null ? this.getMessageType().name() : null);
        dto.setFileUrl(this.getFileUrl());
        dto.setRead(this.getIsRead());
        dto.setTimestamp(this.getTimestamp());
        return dto;
    }
}
