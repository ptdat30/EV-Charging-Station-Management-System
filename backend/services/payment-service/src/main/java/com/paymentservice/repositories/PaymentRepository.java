// FILE: PaymentRepository.java
package com.paymentservice.repositories;

import com.paymentservice.entities.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    // Tìm tất cả payments của một user, sắp xếp theo thời gian tạo mới nhất
    List<Payment> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Tìm payments của user với phân trang
    Page<Payment> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // Tìm payments bị stuck (pending/processing quá lâu)
    List<Payment> findByPaymentStatusInAndCreatedAtBefore(
            List<Payment.PaymentStatus> statuses, 
            java.time.LocalDateTime threshold);
}