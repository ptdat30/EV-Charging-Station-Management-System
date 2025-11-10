// src/main/java/com/loyaltyservice/events/PaymentSuccessListener.java
package com.loyaltyservice.events;

import com.loyaltyservice.entities.LoyaltyAccount;
import com.loyaltyservice.entities.PointsTransaction;
import com.loyaltyservice.repositories.LoyaltyAccountRepository;
import com.loyaltyservice.repositories.PointsTransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class PaymentSuccessListener {

    private static final Logger log = LoggerFactory.getLogger(PaymentSuccessListener.class);

    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final PointsTransactionRepository pointsTransactionRepository;

    public PaymentSuccessListener(LoyaltyAccountRepository loyaltyAccountRepository, PointsTransactionRepository pointsTransactionRepository) {
        this.loyaltyAccountRepository = loyaltyAccountRepository;
        this.pointsTransactionRepository = pointsTransactionRepository;
    }

    // [FIX]: Lắng nghe queue "payment.success" với custom containerFactory để xử lý TypeId mismatch
    @RabbitListener(
        queues = "${app.rabbitmq.queue}",
        containerFactory = "rabbitListenerContainerFactory"
    )
    @Transactional
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        log.info("🎁 ============ LOYALTY EVENT RECEIVED ============");
        log.info("🎁 User ID: {}", event.getUserId());
        log.info("🎁 Amount: {} VND", event.getAmount());
        log.info("🎁 Session ID: {}", event.getSessionId());
        log.info("🎁 Payment ID: {}", event.getPaymentId());
        log.info("🎁 Payment Method: {}", event.getPaymentMethod());
        log.info("🎁 ================================================");

        // 1. Tìm hoặc tạo mới tài khoản Loyalty
        LoyaltyAccount account = loyaltyAccountRepository.findByUserId(event.getUserId())
                .orElseGet(() -> {
                    log.info("No loyalty account found for user ID: {}. Creating new one.", event.getUserId());
                    LoyaltyAccount newAcc = new LoyaltyAccount();
                    newAcc.setUserId(event.getUserId());
                    newAcc.setPointsBalance(0);
                    newAcc.setLifetimePoints(0);
                    newAcc.setTierLevel(LoyaltyAccount.TierLevel.bronze);
                    return loyaltyAccountRepository.save(newAcc);
                });

        // 2. Tính điểm (ví dụ: 1.000đ = 1 điểm)
        int earnedPoints = (int) Math.floor(event.getAmount() / 1000.0);
        log.info("🎁 Calculating points: {} VND / 1000 = {} points", event.getAmount(), earnedPoints);
        
        if (earnedPoints <= 0) {
            log.warn("⚠️ Payment amount {} is too low to earn points for user ID: {}", event.getAmount(), event.getUserId());
            return; // Không làm gì nếu không kiếm được điểm
        }

        // 3. Cập nhật tài khoản Loyalty
        int newBalance = account.getPointsBalance() + earnedPoints;
        account.setPointsBalance(newBalance);
        int newLifetimePoints = account.getLifetimePoints() + earnedPoints;
        account.setLifetimePoints(newLifetimePoints);
        
        // Auto-upgrade tier based on lifetime points
        updateTierLevel(account, newLifetimePoints);
        
        loyaltyAccountRepository.save(account);
        log.info("✅ LOYALTY UPDATED - User ID: {}", event.getUserId());
        log.info("✅ Points Earned: {}", earnedPoints);
        log.info("✅ New Balance: {}", newBalance);
        log.info("✅ Lifetime Points: {}", newLifetimePoints);
        log.info("✅ Tier: {}", account.getTierLevel());

        // 4. Lưu lịch sử giao dịch điểm
        PointsTransaction trx = new PointsTransaction();
        trx.setAccount(account);
        trx.setPoints(earnedPoints);
        trx.setType(PointsTransaction.TransactionType.earn);
        trx.setBalanceAfter(newBalance); // Lưu số dư sau giao dịch
        trx.setDescription("Earned points from charging session");
        trx.setReferenceType("payment"); // Ghi rõ loại tham chiếu
        trx.setReferenceId(event.getPaymentId()); // Lưu ID thanh toán
        // (createdAt sẽ tự động được gán bởi @CreationTimestamp)
        pointsTransactionRepository.save(trx);
    }
    
    /**
     * Auto-upgrade tier level based on lifetime points
     */
    private void updateTierLevel(LoyaltyAccount account, int lifetimePoints) {
        LoyaltyAccount.TierLevel oldTier = account.getTierLevel();
        LoyaltyAccount.TierLevel newTier = calculateTierLevel(lifetimePoints);
        
        if (newTier != oldTier) {
            account.setTierLevel(newTier);
            account.setTierUpdatedAt(LocalDateTime.now());
            log.info("User ID: {} upgraded from {} to {}", account.getUserId(), oldTier, newTier);
        }
    }
    
    /**
     * Calculate tier level based on lifetime points
     */
    private LoyaltyAccount.TierLevel calculateTierLevel(int lifetimePoints) {
        if (lifetimePoints >= 50000) {
            return LoyaltyAccount.TierLevel.diamond;
        } else if (lifetimePoints >= 15000) {
            return LoyaltyAccount.TierLevel.platinum;
        } else if (lifetimePoints >= 5000) {
            return LoyaltyAccount.TierLevel.gold;
        } else if (lifetimePoints >= 1000) {
            return LoyaltyAccount.TierLevel.silver;
        } else {
            return LoyaltyAccount.TierLevel.bronze;
        }
    }
}