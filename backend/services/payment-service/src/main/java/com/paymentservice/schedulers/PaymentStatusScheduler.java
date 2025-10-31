// FILE: PaymentStatusScheduler.java
package com.paymentservice.schedulers;

import com.paymentservice.entities.Payment;
import com.paymentservice.repositories.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled tasks for payment status management:
 * 1. Auto-complete pending payments that have been processed successfully
 * 2. Mark stuck payments (pending/processing for too long) as failed
 */
@Component
@RequiredArgsConstructor
public class PaymentStatusScheduler {

    private static final Logger log = LoggerFactory.getLogger(PaymentStatusScheduler.class);
    
    private final PaymentRepository paymentRepository;

    /**
     * Clean up stuck payments (pending/processing for more than 30 minutes)
     * Runs every 10 minutes
     */
    @Scheduled(fixedRate = 600000) // 10 minutes = 600,000 ms
    @Transactional
    public void cleanupStuckPayments() {
        log.debug("Checking for stuck payments...");
        
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(30);
        
        // Find payments that are pending or processing for more than 30 minutes
        List<Payment.PaymentStatus> stuckStatuses = List.of(
                Payment.PaymentStatus.pending, 
                Payment.PaymentStatus.processing
        );
        List<Payment> stuckPayments = paymentRepository.findByPaymentStatusInAndCreatedAtBefore(
                stuckStatuses, threshold);
        
        if (stuckPayments.isEmpty()) {
            log.debug("No stuck payments found");
            return;
        }
        
        log.warn("Found {} stuck payments, marking as failed", stuckPayments.size());
        
        for (Payment payment : stuckPayments) {
            try {
                payment.setPaymentStatus(Payment.PaymentStatus.failed);
                payment.setPaymentTime(LocalDateTime.now());
                paymentRepository.save(payment);
                log.info("Marked stuck payment {} (created at {}) as failed", 
                        payment.getPaymentId(), payment.getCreatedAt());
            } catch (Exception e) {
                log.error("Failed to update stuck payment {}: {}", 
                        payment.getPaymentId(), e.getMessage(), e);
            }
        }
    }
}

