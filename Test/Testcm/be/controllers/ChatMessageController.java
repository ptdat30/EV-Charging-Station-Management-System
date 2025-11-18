package com.quitsmoking.controllers;

import com.quitsmoking.model.ChatMessage;
import com.quitsmoking.services.ChatMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = {"http://localhost:4173", "http://localhost:3000", "http://localhost:5173"})
public class ChatMessageController {
    
    @Autowired
    private ChatMessageService chatMessageService;
    
    @PostMapping("/messages")
    @PreAuthorize("hasRole('MEMBER') or hasRole('COACH')")
    public ResponseEntity<com.quitsmoking.dto.response.ChatMessageResponse> sendMessage(@RequestBody com.quitsmoking.dto.request.ChatMessageRequest request) {
        ChatMessage.MessageType type = ChatMessage.MessageType.valueOf(request.getMessageType().toUpperCase());
        ChatMessage message = chatMessageService.sendMessage(
            request.getConsultationId(),
            request.getSenderId(),
            request.getContent(),
            type,
            request.getFileUrl()
        );
        return ResponseEntity.ok(message.toResponse());
    }
    
    @GetMapping("/messages/{consultationId}")
    @PreAuthorize("hasRole('MEMBER') or hasRole('COACH')")
    public ResponseEntity<Page<com.quitsmoking.dto.response.ChatMessageResponse>> getMessages(
            @PathVariable String consultationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<ChatMessage> messages = chatMessageService.getMessagesByConsultation(consultationId, pageable);
        Page<com.quitsmoking.dto.response.ChatMessageResponse> response = messages.map(ChatMessage::toResponse);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/messages/{consultationId}/unread")
    @PreAuthorize("hasRole('MEMBER') or hasRole('COACH')")
    public ResponseEntity<List<com.quitsmoking.dto.response.ChatMessageResponse>> getUnreadMessages(
            @PathVariable String consultationId,
            @RequestParam String userId) {
        
        List<ChatMessage> unreadMessages = chatMessageService.getUnreadMessages(consultationId, userId);
        List<com.quitsmoking.dto.response.ChatMessageResponse> response = unreadMessages.stream()
            .map(ChatMessage::toResponse)
            .toList();
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/messages/{consultationId}/mark-read")
    @PreAuthorize("hasRole('MEMBER') or hasRole('COACH')")
    public ResponseEntity<Void> markMessagesAsRead(
            @PathVariable String consultationId,
            @RequestParam String userId) {
        
        chatMessageService.markMessagesAsRead(consultationId, userId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/messages/{consultationId}/unread-count")
    @PreAuthorize("hasRole('MEMBER') or hasRole('COACH')")
    public ResponseEntity<Long> getUnreadMessageCount(
            @PathVariable String consultationId,
            @RequestParam String userId) {
        
        long count = chatMessageService.getUnreadMessageCount(consultationId, userId);
        return ResponseEntity.ok(count);
    }
    
    @DeleteMapping("/messages/{messageId}")
    @PreAuthorize("hasRole('MEMBER') or hasRole('COACH')")
    public ResponseEntity<Void> deleteMessage(@PathVariable String messageId) {
        chatMessageService.deleteMessage(messageId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/messages/{consultationId}/recent")
    @PreAuthorize("hasRole('MEMBER') or hasRole('COACH')")
    public ResponseEntity<List<com.quitsmoking.dto.response.ChatMessageResponse>> getRecentMessages(
            @PathVariable String consultationId,
            @RequestParam(defaultValue = "10") int limit) {
        
        List<ChatMessage> recentMessages = chatMessageService.getRecentMessages(consultationId, limit);
        List<com.quitsmoking.dto.response.ChatMessageResponse> response = recentMessages.stream()
            .map(ChatMessage::toResponse)
            .toList();
        return ResponseEntity.ok(response);
    }
}
