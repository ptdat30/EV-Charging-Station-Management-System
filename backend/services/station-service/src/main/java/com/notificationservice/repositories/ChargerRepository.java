// FILE: ChargerRepository.java
package com.notificationservice.repositories;

import com.notificationservice.entities.Charger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChargerRepository extends JpaRepository<Charger, Long> {
    List<Charger> findByStationStationId(Long stationId);
}