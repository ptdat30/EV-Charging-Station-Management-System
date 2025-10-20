// FILE: PaymentServiceImpl.java
package com.userservice.services;

import com.userservice.dtos.PaymentResponseDto;
import com.userservice.dtos.ProcessPaymentRequestDto;
import com.userservice.entities.Payment;
import com.userservice.entities.Wallet;
import com.userservice.exceptions.ResourceNotFoundException; // Tạo exception này
import com.userservice.repositories.PaymentRepository;
import com.userservice.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Quan trọng cho xử lý giao dịch

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final WalletRepository walletRepository;

    @Override
    @Transactional // Đảm bảo các thao tác DB (trừ tiền, tạo payment) là một giao dịch nguyên tử
    public PaymentResponseDto processPaymentForSession(ProcessPaymentRequestDto requestDto) {
        // 1. Tìm ví của người dùng
        Wallet wallet = walletRepository.findByUserId(requestDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user ID: " + requestDto.getUserId()));

        // 2. Tính toán tổng số tiền cần thanh toán
        BigDecimal amountToPay = requestDto.getEnergyConsumed().multiply(requestDto.getPricePerKwh());

        // 3. Tạo bản ghi Payment với trạng thái ban đầu là pending
        Payment payment = new Payment();
        payment.setSessionId(requestDto.getSessionId());
        payment.setUserId(requestDto.getUserId());
        payment.setAmount(amountToPay);
        payment.setPaymentMethod(Payment.PaymentMethod.wallet); // Giả sử mặc định thanh toán bằng ví
        payment.setPaymentStatus(Payment.PaymentStatus.pending);
        Payment savedPayment = paymentRepository.save(payment);

        // 4. Kiểm tra số dư và thực hiện trừ tiền
        if (wallet.getBalance().compareTo(amountToPay) >= 0) {
            // Đủ tiền
            wallet.setBalance(wallet.getBalance().subtract(amountToPay));
            walletRepository.save(wallet); // Cập nhật số dư ví

            // Cập nhật trạng thái thanh toán thành completed
            savedPayment.setPaymentStatus(Payment.PaymentStatus.completed);
            savedPayment.setPaymentTime(LocalDateTime.now());
        } else {
            // Không đủ tiền
            savedPayment.setPaymentStatus(Payment.PaymentStatus.failed);
            // TO-DO: Có thể gửi thông báo yêu cầu nạp tiền
        }

        Payment finalPayment = paymentRepository.save(savedPayment); // Lưu lại trạng thái cuối cùng
        return convertToDto(finalPayment);
    }

    private PaymentResponseDto convertToDto(Payment payment) {
        PaymentResponseDto dto = new PaymentResponseDto();
        dto.setPaymentId(payment.getPaymentId());
        dto.setSessionId(payment.getSessionId());
        dto.setUserId(payment.getUserId());
        dto.setAmount(payment.getAmount());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setPaymentStatus(payment.getPaymentStatus());
        dto.setPaymentTime(payment.getPaymentTime());
        dto.setCreatedAt(payment.getCreatedAt());
        return dto;
    }
}