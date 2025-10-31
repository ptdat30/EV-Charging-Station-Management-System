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

@Component
public class PaymentSuccessListener {

    private static final Logger log = LoggerFactory.getLogger(PaymentSuccessListener.class);

    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final PointsTransactionRepository pointsTransactionRepository;

    public PaymentSuccessListener(LoyaltyAccountRepository loyaltyAccountRepository, PointsTransactionRepository pointsTransactionRepository) {
        this.loyaltyAccountRepository = loyaltyAccountRepository;
        this.pointsTransactionRepository = pointsTransactionRepository;
    }

    // [FIX]: Lắng nghe queue "loyalty_queue" như định nghĩa trong loyalty-service.yml
    @RabbitListener(queues = "${app.rabbitmq.queue}")
    @Transactional
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        log.info("Received payment success event for user ID: {}, amount: {}", event.getUserId(), event.getAmount());

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
        if (earnedPoints <= 0) {
            log.warn("Payment amount {} is too low to earn points for user ID: {}", event.getAmount(), event.getUserId());
            return; // Không làm gì nếu không kiếm được điểm
        }

        // 3. Cập nhật tài khoản Loyalty
        int newBalance = account.getPointsBalance() + earnedPoints;
        account.setPointsBalance(newBalance);
        account.setLifetimePoints(account.getLifetimePoints() + earnedPoints);
        // (Logic nâng cấp Hạng (Tier) có thể thêm ở đây)
        loyaltyAccountRepository.save(account);
        log.info("Added {} points to user ID: {}. New balance: {}", earnedPoints, event.getUserId(), newBalance);

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
}