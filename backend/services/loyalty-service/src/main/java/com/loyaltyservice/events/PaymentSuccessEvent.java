package com.loyaltyservice.events;

public class PaymentSuccessEvent {
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
}
