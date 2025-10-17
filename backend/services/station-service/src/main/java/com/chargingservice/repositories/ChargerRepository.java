// FILE: ChargerRepository.java
package com.chargingservice.repositories;

import com.chargingservice.entities.Charger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChargerRepository extends JpaRepository<Charger, Long> {
    List<Charger> findByStationStationId(Long stationId);
}