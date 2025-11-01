// FILE: PaymentController.java
package com.paymentservice.controllers;

import com.paymentservice.dtos.PaymentResponseDto;
import com.paymentservice.dtos.ProcessDepositRequestDto;
import com.paymentservice.dtos.ProcessOnSitePaymentRequestDto;
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

    // POST /api/payments/onsite - Xử lý thanh toán tại chỗ (cash/QR)
    @PostMapping("/onsite")
    public ResponseEntity<PaymentResponseDto> processOnSitePayment(@RequestBody ProcessOnSitePaymentRequestDto requestDto) {
        PaymentResponseDto response = paymentService.processOnSitePayment(requestDto);
        return ResponseEntity.ok(response);
    }

    // GET /api/payments/session/{sessionId} - Lấy payments theo sessionId
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<java.util.List<PaymentResponseDto>> getPaymentsBySessionId(@PathVariable Long sessionId) {
        java.util.List<PaymentResponseDto> payments = paymentService.getPaymentsBySessionId(sessionId);
        return ResponseEntity.ok(payments);
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

    // GET /api/payments/admin/all - Admin endpoint to get all payments
    @GetMapping("/admin/all")
    public ResponseEntity<org.springframework.data.domain.Page<PaymentResponseDto>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentMethod) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        
        // TODO: Add filtering by status and paymentMethod in repository if needed
        org.springframework.data.domain.Page<PaymentResponseDto> payments = paymentService.getAllPayments(pageable);
        
        // Apply filters if provided
        java.util.List<PaymentResponseDto> filteredPayments = payments.getContent();
        if (status != null && !status.isEmpty()) {
            filteredPayments = filteredPayments.stream()
                    .filter(p -> p.getPaymentStatus().name().equalsIgnoreCase(status))
                    .toList();
        }
        if (paymentMethod != null && !paymentMethod.isEmpty()) {
            filteredPayments = filteredPayments.stream()
                    .filter(p -> p.getPaymentMethod().name().equalsIgnoreCase(paymentMethod))
                    .toList();
        }
        
        // Return as page (for simplicity, using same pagination info)
        org.springframework.data.domain.Page<PaymentResponseDto> result = new org.springframework.data.domain.PageImpl<>(
                filteredPayments, pageable, filteredPayments.size());
        
        return ResponseEntity.ok(result);
    }

    // POST /api/payments/{paymentId}/confirm - Staff confirm cash payment đã thu tiền
    @PostMapping("/{paymentId}/confirm")
    public ResponseEntity<PaymentResponseDto> confirmCashPayment(@PathVariable Long paymentId) {
        PaymentResponseDto response = paymentService.confirmCashPayment(paymentId);
        return ResponseEntity.ok(response);
    }

    // GET /api/payments/staff/pending-cash - Lấy danh sách cash payments đang pending (cho staff)
    @GetMapping("/staff/pending-cash")
    public ResponseEntity<java.util.List<PaymentResponseDto>> getPendingCashPayments() {
        java.util.List<PaymentResponseDto> payments = paymentService.getPendingCashPayments();
        return ResponseEntity.ok(payments);
    }
}