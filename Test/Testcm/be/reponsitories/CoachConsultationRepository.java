package com.quitsmoking.reponsitories;
import com.quitsmoking.model.CoachConsultation;
import com.quitsmoking.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
@Repository
public interface CoachConsultationRepository extends JpaRepository<CoachConsultation, String> {
    
    List<CoachConsultation> findByMemberOrderByCreatedAtDesc(User member);
    
    List<CoachConsultation> findByCoachOrderByCreatedAtDesc(User coach);
    
    List<CoachConsultation> findByMemberAndStatusOrderByCreatedAtDesc(User member, CoachConsultation.ConsultationStatus status);
    
    List<CoachConsultation> findByCoachAndStatusOrderByCreatedAtDesc(User coach, CoachConsultation.ConsultationStatus status);
    
    // Methods với String ID parameters
    @Query("SELECT cc FROM CoachConsultation cc WHERE cc.member.id = :memberId ORDER BY cc.createdAt DESC")
    Page<CoachConsultation> findByMemberIdOrderByCreatedAtDesc(@Param("memberId") String memberId, Pageable pageable);
    
    @Query("SELECT cc FROM CoachConsultation cc WHERE cc.coach.id = :coachId ORDER BY cc.createdAt DESC")
    Page<CoachConsultation> findByCoachIdOrderByCreatedAtDesc(@Param("coachId") String coachId, Pageable pageable);
    
    // Thêm method với JOIN FETCH để tránh LazyInitializationException
    @Query("SELECT cc FROM CoachConsultation cc JOIN FETCH cc.member JOIN FETCH cc.coach WHERE cc.coach.id = :coachId ORDER BY cc.createdAt DESC")
    List<CoachConsultation> findByCoachIdWithMemberAndCoach(@Param("coachId") String coachId);
    
    @Query("SELECT cc FROM CoachConsultation cc JOIN FETCH cc.member JOIN FETCH cc.coach WHERE cc.member.id = :memberId ORDER BY cc.createdAt DESC")
    List<CoachConsultation> findByMemberIdWithMemberAndCoach(@Param("memberId") String memberId);
    
    @Query("SELECT cc FROM CoachConsultation cc JOIN FETCH cc.member JOIN FETCH cc.coach WHERE cc.member.id = :memberId AND cc.coach.id = :coachId ORDER BY cc.createdAt DESC")
    List<CoachConsultation> findByMemberIdAndCoachIdWithMemberAndCoach(@Param("memberId") String memberId, @Param("coachId") String coachId);
    
    List<CoachConsultation> findByStatus(CoachConsultation.ConsultationStatus status);
    
    Page<CoachConsultation> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    @Query("SELECT cc FROM CoachConsultation cc WHERE cc.scheduledTime BETWEEN :start AND :end ORDER BY cc.scheduledTime")
    List<CoachConsultation> findScheduledConsultations(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT COUNT(cc) FROM CoachConsultation cc WHERE cc.member = :member AND cc.status = 'COMPLETED'")
    Long countCompletedConsultationsByMember(@Param("member") User member);
    
    @Query("SELECT AVG(cc.rating) FROM CoachConsultation cc WHERE cc.coach = :coach AND cc.rating > 0")
    Double getAverageRatingForCoach(@Param("coach") User coach);
    
    @Query("SELECT cc FROM CoachConsultation cc WHERE cc.member.id = :memberId AND cc.coach.id = :coachId ORDER BY cc.createdAt DESC")
    List<CoachConsultation> findByMemberIdAndCoachId(@Param("memberId") String memberId, @Param("coachId") String coachId);
    
    @Query("SELECT cc FROM CoachConsultation cc JOIN FETCH cc.member JOIN FETCH cc.coach ORDER BY cc.createdAt DESC")
    List<CoachConsultation> findAllWithMemberAndCoach();
}

