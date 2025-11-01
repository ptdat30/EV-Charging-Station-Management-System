// FILE: IncidentRepository.java
package com.stationservice.repositories;

import com.stationservice.entities.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByStationIdOrderByCreatedAtDesc(Long stationId);
    List<Incident> findByStatusOrderByCreatedAtDesc(Incident.Status status);
    List<Incident> findAllByOrderByCreatedAtDesc();
}

