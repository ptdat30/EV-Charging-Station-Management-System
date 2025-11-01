// FILE: PaymentService.java
package com.paymentservice.services;

import com.paymentservice.dtos.PaymentResponseDto;
import com.paymentservice.dtos.ProcessDepositRequestDto;
import com.paymentservice.dtos.ProcessOnSitePaymentRequestDto;
import com.paymentservice.dtos.ProcessPaymentRequestDto;
import com.paymentservice.dtos.ProcessRefundRequestDto;
import com.paymentservice.dtos.RefundDepositRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PaymentService {
    PaymentResponseDto processPaymentForSession(ProcessPaymentRequestDto requestDto);
    PaymentResponseDto processDeposit(ProcessDepositRequestDto requestDto);
    PaymentResponseDto processRefund(ProcessRefundRequestDto requestDto);
    PaymentResponseDto refundDeposit(RefundDepositRequestDto requestDto);
    
    // Xử lý thanh toán tại chỗ (cash/QR)
    PaymentResponseDto processOnSitePayment(ProcessOnSitePaymentRequestDto requestDto);
    
    // Lấy danh sách payments của user
    List<PaymentResponseDto> getMyPayments(Long userId);
    Page<PaymentResponseDto> getMyPayments(Long userId, Pageable pageable);
    
    // Lấy payments theo sessionId
    List<PaymentResponseDto> getPaymentsBySessionId(Long sessionId);
    
    // Lấy tất cả payments (Admin only)
    Page<PaymentResponseDto> getAllPayments(Pageable pageable);
    List<PaymentResponseDto> getAllPayments();
    
    // Staff confirm cash payment đã thu tiền
    PaymentResponseDto confirmCashPayment(Long paymentId);
    
    // Lấy danh sách cash payments đang pending (cho staff)
    List<PaymentResponseDto> getPendingCashPayments();
}