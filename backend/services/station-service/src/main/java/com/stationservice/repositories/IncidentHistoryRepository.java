// FILE: IncidentHistoryRepository.java
package com.stationservice.repositories;

import com.stationservice.entities.IncidentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentHistoryRepository extends JpaRepository<IncidentHistory, Long> {
    List<IncidentHistory> findByIncidentIdOrderByCreatedAtDesc(Long incidentId);
    List<IncidentHistory> findByActionByOrderByCreatedAtDesc(Long actionBy);
}

