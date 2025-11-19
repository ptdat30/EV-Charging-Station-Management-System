package com.quitsmoking.services;

import com.quitsmoking.dto.request.WebSocketMessageRequest;
import com.quitsmoking.model.ChatMessage;
import com.quitsmoking.model.CoachConsultation;
import com.quitsmoking.model.User;
import com.quitsmoking.reponsitories.ChatMessageRepository;
import com.quitsmoking.reponsitories.CoachConsultationRepository;
import com.quitsmoking.reponsitories.UserDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ChatMessageService {
    
    @Autowired
    private ChatMessageRepository messageRepository;
    
    @Autowired
    private CoachConsultationRepository consultationRepository;
    
    @Autowired
    private UserDAO userDAO;
    
    @Autowired
    private EncryptionService encryptionService;
    
    public ChatMessage sendMessage(String consultationId, String senderId, String content, 
                                  ChatMessage.MessageType messageType, String fileUrl) {
        CoachConsultation consultation = consultationRepository.findById(consultationId)
            .orElseThrow(() -> new RuntimeException("Consultation not found"));
        
        User sender = userDAO.findById(senderId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        ChatMessage message = new ChatMessage();
        message.setConsultation(consultation);
        message.setSender(sender);
        message.setContent(encryptionService.encrypt(content));
        message.setMessageType(messageType);
        message.setFileUrl(fileUrl);
        message.setTimestamp(LocalDateTime.now());
        message.setIsRead(false);
        
        return messageRepository.save(message);
    }
    
    public ChatMessage saveMessageFromWebSocket(WebSocketMessageRequest request) {
        CoachConsultation consultation = consultationRepository.findById(request.getSessionId())
            .orElseThrow(() -> new RuntimeException("Consultation not found"));
        
        User sender = userDAO.findById(request.getSenderId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        ChatMessage message = new ChatMessage();
        message.setConsultation(consultation);
        message.setSender(sender);
        message.setContent(encryptionService.encrypt(request.getContent()));
        message.setMessageType(ChatMessage.MessageType.valueOf(request.getMessageType()));
        message.setTimestamp(LocalDateTime.now());
        message.setIsRead(false);
        
        return messageRepository.save(message);
    }
    
    public Page<ChatMessage> getMessagesByConsultation(String consultationId, Pageable pageable) {
        Page<ChatMessage> messages = messageRepository.findByConsultationIdWithSenderOrderByTimestampAsc(consultationId, pageable);
        messages.getContent().forEach(this::decryptMessage);
        return messages;
    }
    
    public List<ChatMessage> getUnreadMessages(String consultationId, String userId) {
        List<ChatMessage> messages = messageRepository.findByConsultationIdAndSenderIdNotAndIsReadFalse(consultationId, userId);
        messages.forEach(this::decryptMessage);
        return messages;
    }
    
    public void markMessagesAsRead(String consultationId, String userId) {
        List<ChatMessage> unreadMessages = getUnreadMessages(consultationId, userId);
        unreadMessages.forEach(message -> message.setIsRead(true));
        messageRepository.saveAll(unreadMessages);
    }
    
    public Optional<ChatMessage> getMessageById(String id) {
        Optional<ChatMessage> messageOpt = messageRepository.findById(id);
        messageOpt.ifPresent(this::decryptMessage);
        return messageOpt;
    }
    
    public void deleteMessage(String id) {
        messageRepository.deleteById(id);
    }
    
    public long getUnreadMessageCount(String consultationId, String userId) {
        return messageRepository.countByConsultationIdAndSenderIdNotAndIsReadFalse(consultationId, userId);
    }
    
    public List<ChatMessage> getRecentMessages(String consultationId, int limit) {
        List<ChatMessage> messages = messageRepository.findByConsultationIdWithSenderOrderByTimestampDescLimit(consultationId, limit);
        messages.forEach(this::decryptMessage);
        return messages;
    }
    
    public void deleteMessagesByConsultationId(String consultationId) {
        messageRepository.deleteByConsultationId(consultationId);
    }
    
    private void decryptMessage(ChatMessage message) {
        if (message.getContent() != null && encryptionService.isEncrypted(message.getContent())) {
            try {
                String decryptedContent = encryptionService.decrypt(message.getContent());
                message.setContent(decryptedContent);
            } catch (Exception e) {
                System.err.println("Không thể giải mã tin nhắn: " + e.getMessage());
            }
        }
    }
}
