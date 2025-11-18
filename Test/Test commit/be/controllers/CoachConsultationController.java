package com.quitsmoking.controllers;

import com.quitsmoking.model.CoachConsultation;
import com.quitsmoking.services.CoachConsultationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/coach-consultations")
@CrossOrigin(origins = {"http://localhost:4173", "http://localhost:3000", "http://localhost:5173"})
public class CoachConsultationController {
    @Autowired
    private CoachConsultationService consultationService;

    @Autowired
    private com.quitsmoking.reponsitories.UserDAO userDAO;

    @GetMapping
    @PreAuthorize("hasAnyRole('MEMBER', 'ADMIN', 'COACH')")
    public ResponseEntity<?> getConsultationSessions(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String coachId
    ) {
        // Trường hợp: Admin muốn xem tất cả session (không truyền param)
        if (userId == null && coachId == null) {
            var sessions = consultationService.getAllConsultationsForAdmin()
                .stream()
                .map(CoachConsultation::toDTO)
                .toList();
            return ResponseEntity.ok(sessions);
        }
        // Trường hợp: chỉ truyền coachId (coach lấy tất cả session của mình)
        if (coachId != null && userId == null) {
            var sessions = consultationService.getConsultationsByCoachId(coachId)
                .stream()
                .map(CoachConsultation::toDTO)
                .toList();
            return ResponseEntity.ok(sessions);
        }
        // Trường hợp: truyền cả userId và coachId (lấy session giữa user và coach)
        if (userId != null && coachId != null) {
            Optional<CoachConsultation> session = consultationService.getConsultationByMemberAndCoachWithDetails(userId, coachId);
            return session.map(value -> ResponseEntity.ok(value.toDTO()))
                          .orElseGet(() -> ResponseEntity.ok(null));
        }
        // Trường hợp không truyền đủ param
        return ResponseEntity.badRequest().body("Thiếu tham số userId hoặc coachId");
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllConsultationsForAdmin() {
        try {
            var sessions = consultationService.getAllConsultationsForAdmin()
                .stream()
                .map(CoachConsultation::toDTO)
                .toList();
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi lấy danh sách cuộc trò chuyện: " + e.getMessage());
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MEMBER', 'ADMIN', 'COACH')")
    public ResponseEntity<?> createConsultationSession(@RequestBody java.util.Map<String, Object> payload) {
        String userId = (String) payload.get("userId");
        String coachId = (String) payload.get("coachId");
        String sessionTypeStr = (String) payload.getOrDefault("sessionType", "CHAT");

        if (userId == null || coachId == null) {
            return ResponseEntity.badRequest().body("userId và coachId là bắt buộc");
        }

        // Kiểm tra đã có session chưa - sử dụng method mới để tránh duplicate
        java.util.Optional<CoachConsultation> existing = consultationService.getLatestConsultationByMemberAndCoach(userId, coachId);
        if (existing.isPresent()) {
            return ResponseEntity.ok(existing.get().toDTO());
        }

        // Lấy User từ DB
        com.quitsmoking.model.User member = userDAO.findById(userId).orElse(null);
        com.quitsmoking.model.User coach = userDAO.findById(coachId).orElse(null);
        if (member == null || coach == null) {
            return ResponseEntity.badRequest().body("Không tìm thấy user hoặc coach");
        }

        CoachConsultation.SessionType sessionType = CoachConsultation.SessionType.valueOf(sessionTypeStr);
        CoachConsultation consultation = new CoachConsultation();
        consultation.setMember(member);
        consultation.setCoach(coach);
        consultation.setSessionType(sessionType);
        // Có thể set thêm các trường khác nếu FE gửi lên

        CoachConsultation created = consultationService.createConsultation(consultation);
        return ResponseEntity.ok(created.toDTO());
    }
    
    @PostMapping("/cleanup-duplicates")
    @PreAuthorize("hasRole('ADMIN') or hasRole('COACH')")
    public ResponseEntity<?> cleanupDuplicateSessions(@RequestParam(required = false) String coachId) {
        try {
            int cleanedCount = consultationService.cleanupDuplicateSessions(coachId);
            return ResponseEntity.ok(Map.of(
                "message", "Đã dọn dẹp " + cleanedCount + " session trùng lặp",
                "cleanedCount", cleanedCount
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi dọn dẹp: " + e.getMessage());
        }
    }

    @DeleteMapping("/{consultationId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteConsultation(@PathVariable String consultationId) {
        try {
            consultationService.deleteConsultation(consultationId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa cuộc trò chuyện thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi xóa cuộc trò chuyện: " + e.getMessage());
        }
    }
} 