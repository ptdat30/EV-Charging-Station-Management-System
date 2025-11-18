package com.quitsmoking.dto.response;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
/**
 * DTO cho phản hồi thanh toán
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private boolean success;
    private String message;
    private String transactionId;
    private String paymentUrl;
    private String status;
    private String MembershipPlan;
    private BigDecimal amount;
    private String paymentMethod;
    private LocalDateTime createdAt;
    private Object additionalData;
    // Constructor cho success response
    public PaymentResponse(boolean success, String message, String transactionId) {
        this.success = success;
        this.message = message;
        this.transactionId = transactionId;
    }
    // Constructor cho payment URL response
    public PaymentResponse(boolean success, String message, String transactionId, String paymentUrl) {
        this.success = success;
        this.message = message;
        this.transactionId = transactionId;
        this.paymentUrl = paymentUrl;
    }
    // Static methods for common responses
    public static PaymentResponse success(String message, String transactionId) {
        return new PaymentResponse(true, message, transactionId);
    }
    public static PaymentResponse success(String message, String transactionId, String paymentUrl) {
        return new PaymentResponse(true, message, transactionId, paymentUrl);
    }
    public static PaymentResponse error(String message) {
        return new PaymentResponse(false, message, null);
    }
    public static PaymentResponse pending(String message, String transactionId, String paymentUrl) {
        return new PaymentResponse(true, message, transactionId, paymentUrl);
    }
}