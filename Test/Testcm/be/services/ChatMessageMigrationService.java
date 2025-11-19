package com.quitsmoking.services;

import com.quitsmoking.model.ChatMessage;
import com.quitsmoking.reponsitories.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatMessageMigrationService {
    
    @Autowired
    private ChatMessageRepository messageRepository;
    
    @Autowired
    private EncryptionService encryptionService;
    
    /**
     * Migrate tất cả tin nhắn chưa mã hóa thành mã hóa
     */
    @Transactional
    public int migrateUnencryptedMessages() {
        List<ChatMessage> allMessages = messageRepository.findAll();
        int migratedCount = 0;
        
        for (ChatMessage message : allMessages) {
            if (message.getContent() != null && !encryptionService.isEncrypted(message.getContent())) {
                // Mã hóa nội dung tin nhắn
                String encryptedContent = encryptionService.encrypt(message.getContent());
                message.setContent(encryptedContent);
                messageRepository.save(message);
                migratedCount++;
            }
        }
        
        return migratedCount;
    }
    
    /**
     * Kiểm tra số lượng tin nhắn chưa mã hóa
     */
    public int countUnencryptedMessages() {
        List<ChatMessage> allMessages = messageRepository.findAll();
        int unencryptedCount = 0;
        
        for (ChatMessage message : allMessages) {
            if (message.getContent() != null && !encryptionService.isEncrypted(message.getContent())) {
                unencryptedCount++;
            }
        }
        
        return unencryptedCount;
    }
} 