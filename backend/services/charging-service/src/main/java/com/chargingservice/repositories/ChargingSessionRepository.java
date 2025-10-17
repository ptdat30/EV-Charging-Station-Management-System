// FILE: ChargingSessionRepository.java
package com.chargingservice.repositories;

import com.chargingservice.entities.ChargingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChargingSessionRepository extends JpaRepository<ChargingSession, Long> {
    // Chúng ta sẽ thêm các phương thức truy vấn tùy chỉnh ở đây sau
}