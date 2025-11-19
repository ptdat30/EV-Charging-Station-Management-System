package com.quitsmoking.services;

import com.quitsmoking.model.CoachConsultation;
import com.quitsmoking.reponsitories.CoachConsultationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@Transactional
public class CoachConsultationService {
    
    @Autowired
    private CoachConsultationRepository consultationRepository;
    
    @Autowired
    private ChatMessageService chatMessageService;
    
    public CoachConsultation createConsultation(CoachConsultation consultation) {
        consultation.setCreatedAt(LocalDateTime.now());
        consultation.setStatus(CoachConsultation.ConsultationStatus.SCHEDULED);
        return consultationRepository.save(consultation);
    }
    
    public Optional<CoachConsultation> getConsultationById(String id) {
        return consultationRepository.findById(id);
    }
    
    public Page<CoachConsultation> getConsultationsByMember(String memberId, Pageable pageable) {
        return consultationRepository.findByMemberIdOrderByCreatedAtDesc(memberId, pageable);
    }
    
    public Page<CoachConsultation> getConsultationsByCoach(String coachId, Pageable pageable) {
        return consultationRepository.findByCoachIdOrderByCreatedAtDesc(coachId, pageable);
    }
    
    public List<CoachConsultation> getActiveConsultations() {
        return consultationRepository.findByStatus(CoachConsultation.ConsultationStatus.ACTIVE);
    }
    
    public CoachConsultation updateConsultationStatus(String id, CoachConsultation.ConsultationStatus status) {
        CoachConsultation consultation = consultationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Consultation not found"));
        consultation.setStatus(status);
        consultation.setUpdatedAt(LocalDateTime.now());
        return consultationRepository.save(consultation);
    }
    
    public CoachConsultation updateConsultation(CoachConsultation consultation) {
        consultation.setUpdatedAt(LocalDateTime.now());
        return consultationRepository.save(consultation);
    }
    
    @Transactional
    public void deleteConsultation(String id) {
        // Tìm consultation trước
        CoachConsultation consultation = consultationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Consultation not found"));
        
        // Xóa tất cả tin nhắn chat liên quan trước
        chatMessageService.deleteMessagesByConsultationId(id);
        
        // Sau đó xóa consultation
        consultationRepository.delete(consultation);
    }
    
    public CoachConsultation rateConsultation(String id, Integer rating, String feedback) {
        CoachConsultation consultation = consultationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Consultation not found"));
        consultation.setRating(rating);
        consultation.setFeedback(feedback);
        consultation.setUpdatedAt(LocalDateTime.now());
        return consultationRepository.save(consultation);
    }
    
    public List<CoachConsultation> getConsultationsByStatus(CoachConsultation.ConsultationStatus status) {
        return consultationRepository.findByStatus(status);
    }
    
    public Page<CoachConsultation> getAllConsultations(Pageable pageable) {
        return consultationRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
    
    public List<CoachConsultation> getAllConsultationsForAdmin() {
        return consultationRepository.findAllWithMemberAndCoach();
    }
    
    public Optional<CoachConsultation> getConsultationByMemberAndCoach(String memberId, String coachId) {
        List<CoachConsultation> list = consultationRepository.findByMemberIdAndCoachId(memberId, coachId);
        if (list != null && !list.isEmpty()) {
            return Optional.of(list.get(0)); // Lấy session mới nhất (đã được sắp xếp DESC)
        }
        return Optional.empty();
    }
    
    /**
     * Lấy session mới nhất giữa member và coach, nếu có nhiều session thì merge messages
     */
    public Optional<CoachConsultation> getLatestConsultationByMemberAndCoach(String memberId, String coachId) {
        List<CoachConsultation> sessions = consultationRepository.findByMemberIdAndCoachId(memberId, coachId);
        if (sessions == null || sessions.isEmpty()) {
            return Optional.empty();
        }
        
        // Nếu chỉ có 1 session, trả về luôn
        if (sessions.size() == 1) {
            return Optional.of(sessions.get(0));
        }
        
        // Nếu có nhiều session, lấy session mới nhất và merge messages từ các session khác
        CoachConsultation latestSession = sessions.get(0); // Đã được sắp xếp DESC
        
        // Merge messages từ các session cũ vào session mới nhất
        mergeDuplicateSessions(sessions, latestSession);
        
        return Optional.of(latestSession);
    }
    
    /**
     * Merge messages từ các session cũ vào session mới nhất và xóa các session cũ
     */
    @Transactional
    public void mergeDuplicateSessions(List<CoachConsultation> sessions, CoachConsultation targetSession) {
        if (sessions.size() <= 1) return;
        
        // Lấy tất cả messages từ các session cũ
        List<CoachConsultation> oldSessions = sessions.subList(1, sessions.size());
        
        for (CoachConsultation oldSession : oldSessions) {
            // TODO: Implement message migration logic here
            // Cần inject ChatMessageService để migrate messages
            // Chỉ xóa session cũ nếu không có messages quan trọng
            if (isSessionSafeToDelete(oldSession)) {
                consultationRepository.delete(oldSession);
            }
        }
    }
    
    /**
     * Kiểm tra xem session có an toàn để xóa không (không có messages quan trọng)
     */
    private boolean isSessionSafeToDelete(CoachConsultation session) {
        // TODO: Implement logic kiểm tra messages
        // Tạm thời return true để xóa session cũ
        return true;
    }
    
    /**
     * Cleanup duplicate sessions - xóa các session cũ, chỉ giữ lại session mới nhất cho mỗi member-coach pair
     */
    @Transactional
    public int cleanupDuplicateSessions(String coachId) {
        List<CoachConsultation> allSessions;
        
        if (coachId != null) {
            // Cleanup cho coach cụ thể
            allSessions = consultationRepository.findByCoachIdWithMemberAndCoach(coachId);
        } else {
            // Cleanup tất cả sessions
            allSessions = consultationRepository.findAll();
        }
        
        // Nhóm sessions theo member-coach pair
        Map<String, List<CoachConsultation>> sessionsByPair = allSessions.stream()
            .collect(Collectors.groupingBy(session -> 
                session.getMember().getId() + "_" + session.getCoach().getId()));
        
        int deletedCount = 0;
        
        for (List<CoachConsultation> sessions : sessionsByPair.values()) {
            if (sessions.size() > 1) {
                // Sắp xếp theo thời gian tạo, giữ lại session mới nhất
                sessions.sort((s1, s2) -> s2.getCreatedAt().compareTo(s1.getCreatedAt()));
                
                // Xóa các session cũ
                for (int i = 1; i < sessions.size(); i++) {
                    if (isSessionSafeToDelete(sessions.get(i))) {
                        consultationRepository.delete(sessions.get(i));
                        deletedCount++;
                    }
                }
            }
        }
        
        return deletedCount;
    }
    
    // Lấy tất cả session theo coachId (không phân trang) - đã deduplicate
    public List<CoachConsultation> getConsultationsByCoachId(String coachId) {
        // Sử dụng method với JOIN FETCH để tránh LazyInitializationException
        List<CoachConsultation> allSessions = consultationRepository.findByCoachIdWithMemberAndCoach(coachId);
        System.out.println("DEBUG: Found " + allSessions.size() + " sessions for coach " + coachId);
        
        // Deduplicate sessions - chỉ giữ lại session mới nhất cho mỗi member
        List<CoachConsultation> deduped = deduplicateSessionsByMember(allSessions);
        System.out.println("DEBUG: After deduplication: " + deduped.size() + " sessions");
        
        // Trả về tất cả session đã deduplicate (không filter theo tin nhắn)
        return deduped;
    }
    
    /**
     * Deduplicate sessions - chỉ giữ lại session mới nhất cho mỗi member
     */
    private List<CoachConsultation> deduplicateSessionsByMember(List<CoachConsultation> sessions) {
        Map<String, CoachConsultation> latestSessionsByMember = new HashMap<>();
        
        for (CoachConsultation session : sessions) {
            String memberId = session.getMember().getId();
            
            // Nếu chưa có session cho member này, hoặc session hiện tại mới hơn
            if (!latestSessionsByMember.containsKey(memberId) || 
                session.getCreatedAt().isAfter(latestSessionsByMember.get(memberId).getCreatedAt())) {
                latestSessionsByMember.put(memberId, session);
            }
        }
        
        // Trả về danh sách đã deduplicate, sắp xếp theo thời gian tạo mới nhất
        return latestSessionsByMember.values().stream()
            .sorted((s1, s2) -> s2.getCreatedAt().compareTo(s1.getCreatedAt()))
            .collect(Collectors.toList());
    }
    
    // Thêm method mới để lấy consultation với member và coach đã được load
    public List<CoachConsultation> getConsultationsByMemberId(String memberId) {
        return consultationRepository.findByMemberIdWithMemberAndCoach(memberId);
    }
    
    public Optional<CoachConsultation> getConsultationByMemberAndCoachWithDetails(String memberId, String coachId) {
        List<CoachConsultation> list = consultationRepository.findByMemberIdAndCoachIdWithMemberAndCoach(memberId, coachId);
        if (list != null && !list.isEmpty()) {
            return Optional.of(list.get(0)); // Lấy session mới nhất
        }
        return Optional.empty();
    }
}
