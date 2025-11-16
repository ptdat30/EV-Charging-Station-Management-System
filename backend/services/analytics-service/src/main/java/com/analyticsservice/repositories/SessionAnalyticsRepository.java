// FILE: SessionAnalyticsRepository.java
package com.analyticsservice.repositories;

import com.analyticsservice.entities.SessionAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionAnalyticsRepository extends JpaRepository<SessionAnalytics, Long> {
    
    List<SessionAnalytics> findByUserId(Long userId);
    
    List<SessionAnalytics> findByStationId(Long stationId);
    
    Optional<SessionAnalytics> findBySessionId(Long sessionId);
    
    List<SessionAnalytics> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT SUM(sa.energyConsumed) FROM SessionAnalytics sa WHERE sa.startTime BETWEEN :start AND :end")
    BigDecimal getTotalEnergyConsumedBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT SUM(sa.cost) FROM SessionAnalytics sa WHERE sa.startTime BETWEEN :start AND :end")
    BigDecimal getTotalRevenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT COUNT(DISTINCT sa.userId) FROM SessionAnalytics sa WHERE sa.startTime BETWEEN :start AND :end")
    Long countUniqueUsersBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT sa.hourOfDay, COUNT(sa) as sessionCount FROM SessionAnalytics sa " +
           "WHERE sa.startTime BETWEEN :start AND :end GROUP BY sa.hourOfDay ORDER BY sessionCount DESC")
    List<Object[]> findPeakHoursBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}

