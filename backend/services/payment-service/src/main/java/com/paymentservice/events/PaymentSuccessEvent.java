package com.paymentservice.events;

import java.io.Serializable;

/**
 * Event được publish khi payment thành công
 * Loyalty service sẽ lắng nghe event này để cộng điểm thưởng
 */
public class PaymentSuccessEvent implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Long userId;
    private Long sessionId;
    private Long paymentId;
    private Double amount;
    private String paymentMethod;

    public PaymentSuccessEvent() {}

    public PaymentSuccessEvent(Long userId, Long sessionId, Long paymentId, Double amount, String paymentMethod) {
        this.userId = userId;
        this.sessionId = sessionId;
        this.paymentId = paymentId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }
    
    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }
    
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    @Override
    public String toString() {
        return "PaymentSuccessEvent{" +
                "userId=" + userId +
                ", sessionId=" + sessionId +
                ", paymentId=" + paymentId +
                ", amount=" + amount +
                ", paymentMethod='" + paymentMethod + '\'' +
                '}';
    }
}

