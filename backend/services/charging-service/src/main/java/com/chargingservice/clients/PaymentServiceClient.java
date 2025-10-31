// FILE: PaymentServiceClient.java (trong charging-service)
package com.chargingservice.clients;

import com.chargingservice.dtos.internal.PaymentResponseDto;
import com.chargingservice.dtos.internal.ProcessDepositRequestDto;
import com.chargingservice.dtos.internal.ProcessPaymentRequestDto;
import com.chargingservice.dtos.internal.ProcessRefundRequestDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

// [COMMAND]: Định nghĩa client để gọi đến PAYMENT-SERVICE
@FeignClient(name = "PAYMENT-SERVICE")
public interface PaymentServiceClient {

    // [COMMAND]: Khai báo phương thức khớp với endpoint bên payment-service
    // POST /api/payments/process
    @PostMapping("/api/payments/process")
    PaymentResponseDto processPayment(@RequestBody ProcessPaymentRequestDto requestDto);

    @PostMapping("/api/payments/deposit")
    PaymentResponseDto processDeposit(@RequestBody ProcessDepositRequestDto requestDto);

    @PostMapping("/api/payments/refund")
    PaymentResponseDto processRefund(@RequestBody ProcessRefundRequestDto requestDto);
    
    @PostMapping("/api/payments/refund-deposit")
    PaymentResponseDto refundDeposit(@RequestBody com.chargingservice.dtos.internal.RefundDepositRequestDto requestDto);
}