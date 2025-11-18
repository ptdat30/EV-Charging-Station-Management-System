package com.quitsmoking.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "membership_transactions")
@Getter
@Setter
@NoArgsConstructor
public class MembershipTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "VARCHAR(36)")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY) // Mối quan hệ nhiều giao dịch với một gói thành viên
    @JoinColumn(name = "membership_plan_id", nullable = false) // Đây là cột khóa ngoại trỏ đến MembershipPlan entity
    private MembershipPlan membershipPlan; 

    @Column(name = "transaction_id", unique = true)
    private String transactionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type")
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Column(name = "amount", precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", length = 3)
    private String currency = "VND";

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "final_amount", precision = 10, scale = 2)
    private BigDecimal finalAmount;

    @Column(name = "discount_code")
    private String discountCode;

    @Column(name = "payment_gateway")
    private String paymentGateway;

    @Column(name = "gateway_transaction_id")
    private String gatewayTransactionId;

    @Column(name = "gateway_response", columnDefinition = "TEXT")
    private String gatewayResponse;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public enum TransactionType {
        UPGRADE, RENEWAL, DOWNGRADE, REFUND, FREE_TRIAL
    }

    public enum PaymentStatus {
        PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED, REFUNDED
    }

    public enum PaymentMethod {
        CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, E_WALLET, CASH, FREE
    }

    @PrePersist // Set createdAt when entity is first persisted
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) { // Also initialize updatedAt on creation
            updatedAt = LocalDateTime.now();
        }
        // Ensure final_amount is calculated before persisting if not already set
        if (finalAmount == null && amount != null && discountAmount != null) {
            finalAmount = amount.subtract(discountAmount);
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        // Recalculate final_amount if amount or discount_amount changes (optional)
        if (amount != null && discountAmount != null) {
            finalAmount = amount.subtract(discountAmount);
        }
    }

    public void setPaymentGatewayReference(String paymentGatewayReference) {
        this.gatewayTransactionId = paymentGatewayReference; // Hoặc dùng trường bạn đã đổi tên
    }
}