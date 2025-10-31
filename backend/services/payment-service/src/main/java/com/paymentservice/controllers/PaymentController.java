// FILE: PaymentController.java
package com.paymentservice.controllers;

import com.paymentservice.dtos.PaymentResponseDto;
import com.paymentservice.dtos.ProcessDepositRequestDto;
import com.paymentservice.dtos.ProcessPaymentRequestDto;
import com.paymentservice.dtos.ProcessRefundRequestDto;
import com.paymentservice.dtos.RefundDepositRequestDto;
import com.paymentservice.services.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/process")
    public ResponseEntity<PaymentResponseDto> processPayment(@RequestBody ProcessPaymentRequestDto requestDto) {
        PaymentResponseDto response = paymentService.processPaymentForSession(requestDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/deposit")
    public ResponseEntity<PaymentResponseDto> processDeposit(@RequestBody ProcessDepositRequestDto requestDto) {
        System.out.println("✅ PaymentController.processDeposit called - reservationId: " + 
                (requestDto != null ? requestDto.getReservationId() : "null") + 
                ", userId: " + (requestDto != null ? requestDto.getUserId() : "null"));
        PaymentResponseDto response = paymentService.processDeposit(requestDto);
        System.out.println("✅ PaymentController.processDeposit returning - paymentId: " + 
                (response != null ? response.getPaymentId() : "null") + 
                ", status: " + (response != null && response.getPaymentStatus() != null ? response.getPaymentStatus() : "null"));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refund")
    public ResponseEntity<PaymentResponseDto> processRefund(@RequestBody ProcessRefundRequestDto requestDto) {
        PaymentResponseDto response = paymentService.processRefund(requestDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refund-deposit")
    public ResponseEntity<PaymentResponseDto> refundDeposit(@RequestBody RefundDepositRequestDto requestDto) {
        PaymentResponseDto response = paymentService.refundDeposit(requestDto);
        return ResponseEntity.ok(response);
    }

    // GET /api/payments/my-transactions
    @GetMapping("/my-transactions")
    public ResponseEntity<org.springframework.data.domain.Page<PaymentResponseDto>> getMyTransactions(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<PaymentResponseDto> payments = paymentService.getMyPayments(userId, pageable);
        return ResponseEntity.ok(payments);
    }
}