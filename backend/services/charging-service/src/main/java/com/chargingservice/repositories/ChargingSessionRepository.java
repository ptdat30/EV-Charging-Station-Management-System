// FILE: ChargingSessionRepository.java
package com.chargingservice.repositories;

import com.chargingservice.entities.ChargingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChargingSessionRepository extends JpaRepository<ChargingSession, Long> {
    List<ChargingSession> findByUserIdOrderByStartTimeDesc(Long userId);
    Optional<ChargingSession> findFirstByUserIdAndSessionStatusOrderByStartTimeDesc(Long userId, ChargingSession.SessionStatus status);

    Optional<ChargingSession> findFirstByChargerIdAndSessionStatus(Long chargerId, ChargingSession.SessionStatus status);
    
    // Find sessions by status
    List<ChargingSession> findBySessionStatus(ChargingSession.SessionStatus status);
    
    // Find all active sessions for a user (charging, starting, paused, reserved)
    // Used to prevent duplicate active sessions
    @Query("SELECT s FROM ChargingSession s WHERE s.userId = :userId AND " +
           "s.sessionStatus IN ('charging', 'starting', 'paused', 'reserved')")
    List<ChargingSession> findActiveSessionsByUserId(@Param("userId") Long userId);
}