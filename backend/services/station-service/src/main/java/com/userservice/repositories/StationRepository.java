// FILE: StationRepository.java
package com.userservice.repositories;

import com.userservice.entities.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {
}