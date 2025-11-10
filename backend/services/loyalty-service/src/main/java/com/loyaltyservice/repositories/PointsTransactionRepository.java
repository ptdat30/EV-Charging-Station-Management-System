package com.loyaltyservice.repositories;

import com.loyaltyservice.entities.LoyaltyAccount;
import com.loyaltyservice.entities.PointsTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PointsTransactionRepository extends JpaRepository<PointsTransaction, Long> {
    List<PointsTransaction> findByAccount_AccountId(Long accountId);
    List<PointsTransaction> findByAccountOrderByCreatedAtDesc(LoyaltyAccount account);
}
