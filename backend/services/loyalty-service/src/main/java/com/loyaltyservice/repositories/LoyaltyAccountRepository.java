package com.loyaltyservice.repositories;

import com.loyaltyservice.entities.LoyaltyAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LoyaltyAccountRepository extends JpaRepository<LoyaltyAccount, Long> {
    Optional<LoyaltyAccount> findByUserId(Long userId);
}
