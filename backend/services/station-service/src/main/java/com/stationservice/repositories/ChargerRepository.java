// FILE: ChargerRepository.java
package com.stationservice.repositories;

import com.stationservice.entities.Charger;
import com.stationservice.entities.Charger.ChargerStatus;
import com.stationservice.entities.Charger.ChargerType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;

@Repository
public interface ChargerRepository extends JpaRepository<Charger, Long> {
    List<Charger> findByStationStationId(Long stationId);
    List<Charger> findByStationStationIdIn(Collection<Long> stationIds);
    List<Charger> findByChargerType(ChargerType chargerType);
    List<Charger> findByPowerRatingGreaterThanEqual(BigDecimal minPower);
    List<Charger> findByStatus(ChargerStatus status);
}