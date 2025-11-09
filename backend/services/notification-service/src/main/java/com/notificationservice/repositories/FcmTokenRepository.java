package com.notificationservice.repositories;

import com.notificationservice.entities.FcmToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FcmTokenRepository extends JpaRepository<FcmToken, Long> {
    
    /**
     * Find all active tokens for a user
     */
    List<FcmToken> findByUserIdAndIsActiveTrue(Long userId);
    
    /**
     * Find token by token string
     */
    Optional<FcmToken> findByToken(String token);
    
    /**
     * Find token by user and device
     */
    Optional<FcmToken> findByUserIdAndDeviceId(Long userId, String deviceId);
    
    /**
     * Deactivate old tokens for user (keep only recent ones)
     */
    @Modifying
    @Query("UPDATE FcmToken f SET f.isActive = false WHERE f.userId = :userId AND f.fcmTokenId NOT IN :keepTokenIds")
    void deactivateOldTokensExcept(@Param("userId") Long userId, @Param("keepTokenIds") List<Long> keepTokenIds);
    
    /**
     * Deactivate a specific token
     */
    @Modifying
    @Query("UPDATE FcmToken f SET f.isActive = false WHERE f.token = :token")
    void deactivateToken(@Param("token") String token);
    
    /**
     * Count active tokens for user
     */
    long countByUserIdAndIsActiveTrue(Long userId);
}

