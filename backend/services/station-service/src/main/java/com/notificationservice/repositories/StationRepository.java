// FILE: StationRepository.java
package com.notificationservice.repositories;

import com.notificationservice.entities.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {
}