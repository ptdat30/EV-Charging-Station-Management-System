// FILE: IncidentRepository.java
package com.stationservice.repositories;

import com.stationservice.entities.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByStationIdOrderByCreatedAtDesc(Long stationId);
    List<Incident> findByStatusOrderByCreatedAtDesc(Incident.Status status);
    List<Incident> findByPriorityOrderByCreatedAtDesc(Incident.Priority priority);
    List<Incident> findByAssignedToOrderByCreatedAtDesc(Long assignedTo);
    List<Incident> findByIncidentTypeOrderByCreatedAtDesc(Incident.IncidentType incidentType);
    List<Incident> findBySeverityOrderByCreatedAtDesc(Incident.Severity severity);
    
    @Query("SELECT i FROM Incident i WHERE i.status IN :statuses ORDER BY i.priority DESC, i.createdAt DESC")
    List<Incident> findByStatusInOrderByPriorityDescCreatedAtDesc(@Param("statuses") List<Incident.Status> statuses);
    
    @Query("SELECT i FROM Incident i WHERE i.priority = :priority AND i.status != 'resolved' AND i.status != 'closed' ORDER BY i.createdAt DESC")
    List<Incident> findActiveByPriorityOrderByCreatedAtDesc(@Param("priority") Incident.Priority priority);
    
    List<Incident> findAllByOrderByPriorityDescCreatedAtDesc();
}

