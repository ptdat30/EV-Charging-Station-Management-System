// FILE: ChargingSessionRepository.java
package com.chargingservice.repositories;

import com.chargingservice.entities.ChargingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChargingSessionRepository extends JpaRepository<ChargingSession, Long> {
    java.util.List<ChargingSession> findByUserIdOrderByStartTimeDesc(Long userId);
    java.util.Optional<ChargingSession> findFirstByUserIdAndSessionStatusOrderByStartTimeDesc(Long userId, com.chargingservice.entities.ChargingSession.SessionStatus status);

    Optional<ChargingSession> findFirstByChargerIdAndSessionStatus(Long chargerId, ChargingSession.SessionStatus status);
    
    // Find sessions by status
    java.util.List<ChargingSession> findBySessionStatus(ChargingSession.SessionStatus status);
}