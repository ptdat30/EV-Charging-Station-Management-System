package com.quitsmoking.reponsitories;

import com.quitsmoking.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    
    @Query("SELECT m FROM ChatMessage m JOIN FETCH m.sender WHERE m.consultation.id = :consultationId ORDER BY m.timestamp ASC")
    Page<ChatMessage> findByConsultationIdWithSenderOrderByTimestampAsc(@Param("consultationId") String consultationId, Pageable pageable);
    
    Page<ChatMessage> findByConsultationIdOrderByTimestampAsc(String consultationId, Pageable pageable);
    
    List<ChatMessage> findByConsultationIdAndSenderIdNotAndIsReadFalse(String consultationId, String senderId);
    
    long countByConsultationIdAndSenderIdNotAndIsReadFalse(String consultationId, String senderId);
    
    @Query("SELECT m FROM ChatMessage m JOIN FETCH m.sender WHERE m.consultation.id = :consultationId ORDER BY m.timestamp DESC LIMIT :limit")
    List<ChatMessage> findByConsultationIdWithSenderOrderByTimestampDescLimit(@Param("consultationId") String consultationId, @Param("limit") int limit);
    
    @Query("SELECT m FROM ChatMessage m WHERE m.consultation.id = :consultationId ORDER BY m.timestamp DESC LIMIT :limit")
    List<ChatMessage> findByConsultationIdOrderByTimestampDescLimit(@Param("consultationId") String consultationId, @Param("limit") int limit);
    
    List<ChatMessage> findByConsultationIdOrderByTimestampAsc(String consultationId);
    
    List<ChatMessage> findBySenderIdOrderByTimestampDesc(String senderId);
    
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.consultation.id = :consultationId")
    long countByConsultationId(@Param("consultationId") String consultationId);
    
    void deleteByConsultationId(@Param("consultationId") String consultationId);
}
