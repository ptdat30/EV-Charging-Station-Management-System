// FILE: WalletRepository.java
package com.notificationservice.repositories;

import com.notificationservice.entities.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    // [COMMAND]: Phương thức để tìm ví bằng ID của người dùng.
    Optional<Wallet> findByUserId(Long userId);
}