// FILE: ChargerRepository.java
package com.stationservice.repositories;

import com.stationservice.entities.Charger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChargerRepository extends JpaRepository<Charger, Long> {
}