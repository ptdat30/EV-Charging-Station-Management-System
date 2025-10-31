// src/main/java/com/userservice/repositories/DriverProfileRepository.java
package com.userservice.repositories;

import com.userservice.entities.DriverProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DriverProfileRepository extends JpaRepository<DriverProfile, Long> {
    /**
     * Tìm kiếm DriverProfile dựa trên ID của User liên kết.
     * @param userId ID của User.
     * @return Optional chứa DriverProfile nếu tìm thấy.
     */
    Optional<DriverProfile> findByUserId(Long userId);
}