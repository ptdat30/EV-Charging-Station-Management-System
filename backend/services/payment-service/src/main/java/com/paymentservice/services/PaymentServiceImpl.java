// FILE: PaymentServiceImpl.java
package com.paymentservice.services;

import com.paymentservice.dtos.PaymentResponseDto;
import com.paymentservice.dtos.ProcessDepositRequestDto;
import com.paymentservice.dtos.ProcessOnSitePaymentRequestDto;
import com.paymentservice.dtos.ProcessPaymentRequestDto;
import com.paymentservice.dtos.ProcessRefundRequestDto;
import com.paymentservice.dtos.RefundDepositRequestDto;
import com.paymentservice.entities.Payment;
import com.paymentservice.entities.Wallet;
import com.paymentservice.exceptions.ResourceNotFoundException;
import com.paymentservice.repositories.PaymentRepository;
import com.paymentservice.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);
    private final PaymentRepository paymentRepository;
    private final WalletRepository walletRepository;
    private final com.paymentservice.clients.ChargingServiceClient chargingServiceClient;

    @Override
    @Transactional // Đảm bảo các thao tác DB (trừ tiền, tạo payment) là một giao dịch nguyên tử
    public PaymentResponseDto processPaymentForSession(ProcessPaymentRequestDto requestDto) {
        // 1. Tìm ví của người dùng
        Wallet wallet = walletRepository.findByUserId(requestDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user ID: " + requestDto.getUserId()));

        // 2. Tính toán tổng số tiền cần thanh toán
        BigDecimal amountToPay = requestDto.getEnergyConsumed().multiply(requestDto.getPricePerKwh());

        // 3. Xác định payment method
        String paymentMethodStr = requestDto.getPaymentMethod() != null && !requestDto.getPaymentMethod().isEmpty()
                ? requestDto.getPaymentMethod()
                : "wallet"; // Default là wallet
        
        Payment.PaymentMethod paymentMethodEnum;
        try {
            paymentMethodEnum = Payment.PaymentMethod.valueOf(paymentMethodStr.toLowerCase());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid payment method: {}, defaulting to wallet", paymentMethodStr);
            paymentMethodEnum = Payment.PaymentMethod.wallet;
        }

        // 4. Tạo bản ghi Payment với trạng thái ban đầu là pending
        Payment payment = new Payment();
        payment.setSessionId(requestDto.getSessionId());
        payment.setUserId(requestDto.getUserId());
        payment.setAmount(amountToPay);
        payment.setPaymentMethod(paymentMethodEnum);
        payment.setPaymentStatus(Payment.PaymentStatus.pending);
        Payment savedPayment = paymentRepository.save(payment);

        // 5. Xử lý thanh toán theo method
        if (paymentMethodEnum == Payment.PaymentMethod.wallet) {
            // Thanh toán bằng ví: Kiểm tra số dư và thực hiện trừ tiền
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
                log.warn("Insufficient wallet balance for user {}. Required: {}, Available: {}", 
                        requestDto.getUserId(), amountToPay, wallet.getBalance());
            }
        } else if (paymentMethodEnum == Payment.PaymentMethod.cash) {
            // Thanh toán bằng tiền mặt: Giữ status pending, chờ staff confirm đã thu tiền
            savedPayment.setPaymentStatus(Payment.PaymentStatus.pending);
            // Không set paymentTime, sẽ set khi staff confirm
            log.info("Cash payment created with pending status for session {}. Waiting for staff confirmation.", requestDto.getSessionId());
        } else {
            // Các phương thức khác (QR, e_wallet, etc.)
            // Đánh dấu completed (giả sử đã thanh toán thành công)
            savedPayment.setPaymentStatus(Payment.PaymentStatus.completed);
            savedPayment.setPaymentTime(LocalDateTime.now());
            log.info("Payment method {} processed for session {}", paymentMethodEnum, requestDto.getSessionId());
        }

        Payment finalPayment = paymentRepository.save(savedPayment); // Lưu lại trạng thái cuối cùng
        
        // Mark session as paid if payment was completed
        if (finalPayment.getPaymentStatus() == Payment.PaymentStatus.completed) {
            try {
                chargingServiceClient.markSessionAsPaid(finalPayment.getSessionId(), finalPayment.getPaymentId());
                log.info("Session {} marked as paid", finalPayment.getSessionId());
            } catch (Exception e) {
                log.error("Failed to mark session {} as paid: {}", finalPayment.getSessionId(), e.getMessage());
                // Continue even if marking fails - payment was still successful
            }
        }
        
        return convertToDto(finalPayment);
    }

    @Override
    @Transactional
    public PaymentResponseDto processDeposit(ProcessDepositRequestDto requestDto) {
        log.info("Processing deposit for reservation {} - user {} - amount {}", 
                requestDto.getReservationId(), requestDto.getUserId(), requestDto.getAmount());
        
        // 1. Tìm ví của người dùng
        Wallet wallet = walletRepository.findByUserId(requestDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user ID: " + requestDto.getUserId()));

        // 2. Kiểm tra số dư
        if (wallet.getBalance().compareTo(requestDto.getAmount()) < 0) {
            throw new IllegalStateException("Insufficient balance for deposit. Required: " + 
                    requestDto.getAmount() + ", Available: " + wallet.getBalance());
        }

        // 3. Tạo payment record cho deposit (sessionId = null, sẽ dùng description để lưu reservationId)
        Payment payment = new Payment();
        payment.setSessionId(null); // Deposit không có session
        payment.setUserId(requestDto.getUserId());
        payment.setAmount(requestDto.getAmount());
        payment.setPaymentMethod(Payment.PaymentMethod.valueOf(requestDto.getPaymentMethod()));
        payment.setPaymentStatus(Payment.PaymentStatus.pending);
        
        Payment savedPayment = paymentRepository.save(payment);

        // 4. Trừ tiền từ ví
        wallet.setBalance(wallet.getBalance().subtract(requestDto.getAmount()));
        walletRepository.save(wallet);

        // 5. Cập nhật trạng thái payment thành completed
        savedPayment.setPaymentStatus(Payment.PaymentStatus.completed);
        savedPayment.setPaymentTime(LocalDateTime.now());
        Payment finalPayment = paymentRepository.save(savedPayment);
        
        log.info("Deposit processed successfully. Payment ID: {}", finalPayment.getPaymentId());
        return convertToDto(finalPayment);
    }

    @Override
    @Transactional
    public PaymentResponseDto processRefund(ProcessRefundRequestDto requestDto) {
        log.info("Processing refund for payment {} - user {} - reason: {}", 
                requestDto.getPaymentId(), requestDto.getUserId(), requestDto.getReason());
        
        // 1. Tìm payment record
        Payment payment = paymentRepository.findById(requestDto.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + requestDto.getPaymentId()));

        // 2. Kiểm tra payment thuộc về user
        if (!payment.getUserId().equals(requestDto.getUserId())) {
            throw new IllegalStateException("Payment does not belong to user: " + requestDto.getUserId());
        }

        // 3. Kiểm tra payment đã được refund chưa
        if (payment.getPaymentStatus() == Payment.PaymentStatus.refunded) {
            throw new IllegalStateException("Payment already refunded");
        }

        // 4. Kiểm tra payment phải ở trạng thái completed
        if (payment.getPaymentStatus() != Payment.PaymentStatus.completed) {
            throw new IllegalStateException("Cannot refund payment with status: " + payment.getPaymentStatus());
        }

        // 5. Tìm ví và hoàn tiền
        Wallet wallet = walletRepository.findByUserId(requestDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user ID: " + requestDto.getUserId()));

        wallet.setBalance(wallet.getBalance().add(payment.getAmount()));
        walletRepository.save(wallet);

        // 6. Cập nhật trạng thái payment thành refunded
        payment.setPaymentStatus(Payment.PaymentStatus.refunded);
        payment.setPaymentTime(LocalDateTime.now());
        Payment refundedPayment = paymentRepository.save(payment);
        
        log.info("Refund processed successfully. Payment ID: {}, Amount: {}", 
                refundedPayment.getPaymentId(), refundedPayment.getAmount());
        return convertToDto(refundedPayment);
    }

    @Override
    @Transactional
    public PaymentResponseDto refundDeposit(RefundDepositRequestDto requestDto) {
        log.info("Refunding deposit for reservation {} - payment {} - user {} - amount {}", 
                requestDto.getReservationId(), requestDto.getPaymentId(), requestDto.getUserId(), requestDto.getAmount());
        
        // 1. Tìm payment record bằng paymentId
        if (requestDto.getPaymentId() == null) {
            throw new IllegalArgumentException("Payment ID is required for deposit refund");
        }
        
        Payment payment = paymentRepository.findById(requestDto.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + requestDto.getPaymentId()));

        // 2. Kiểm tra payment thuộc về user
        if (!payment.getUserId().equals(requestDto.getUserId())) {
            throw new IllegalStateException("Payment does not belong to user: " + requestDto.getUserId());
        }

        // 3. Kiểm tra payment đã được refund chưa
        if (payment.getPaymentStatus() == Payment.PaymentStatus.refunded) {
            throw new IllegalStateException("Deposit payment already refunded");
        }

        // 4. Kiểm tra payment phải ở trạng thái completed (deposit đã được thanh toán)
        if (payment.getPaymentStatus() != Payment.PaymentStatus.completed) {
            throw new IllegalStateException("Cannot refund deposit payment with status: " + payment.getPaymentStatus());
        }

        // 5. Tìm ví và hoàn tiền
        Wallet wallet = walletRepository.findByUserId(requestDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user ID: " + requestDto.getUserId()));

        wallet.setBalance(wallet.getBalance().add(payment.getAmount()));
        walletRepository.save(wallet);

        // 6. Cập nhật trạng thái payment thành refunded
        payment.setPaymentStatus(Payment.PaymentStatus.refunded);
        payment.setPaymentTime(LocalDateTime.now());
        Payment refundedPayment = paymentRepository.save(payment);
        
        log.info("Deposit refunded successfully for reservation {}. Payment ID: {}, Amount: {}", 
                requestDto.getReservationId(), refundedPayment.getPaymentId(), refundedPayment.getAmount());
        return convertToDto(refundedPayment);
    }

    @Override
    public List<PaymentResponseDto> getMyPayments(Long userId) {
        List<Payment> payments = paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return payments.stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    @Transactional
    public PaymentResponseDto confirmCashPayment(Long paymentId) {
        log.info("Staff confirming cash payment: {}", paymentId);
        
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + paymentId));
        
        // Chỉ confirm được cash payment đang pending
        if (payment.getPaymentMethod() != Payment.PaymentMethod.cash) {
            throw new IllegalStateException("Only cash payments can be confirmed");
        }
        
        if (payment.getPaymentStatus() != Payment.PaymentStatus.pending) {
            throw new IllegalStateException("Payment is not pending. Current status: " + payment.getPaymentStatus());
        }
        
        // Cập nhật trạng thái thành completed và set paymentTime
        payment.setPaymentStatus(Payment.PaymentStatus.completed);
        payment.setPaymentTime(LocalDateTime.now());
        
        Payment confirmedPayment = paymentRepository.save(payment);
        log.info("Cash payment {} confirmed successfully by staff", paymentId);
        
        return convertToDto(confirmedPayment);
    }

    @Override
    public List<PaymentResponseDto> getPendingCashPayments() {
        log.info("Fetching pending cash payments for staff");
        
        List<Payment> pendingPayments = paymentRepository.findByPaymentMethodAndPaymentStatus(
                Payment.PaymentMethod.cash,
                Payment.PaymentStatus.pending
        );
        
        return pendingPayments.stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    public Page<PaymentResponseDto> getMyPayments(Long userId, Pageable pageable) {
        Page<Payment> paymentsPage = paymentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return paymentsPage.map(this::convertToDto);
    }

    @Override
    public Page<PaymentResponseDto> getAllPayments(Pageable pageable) {
        Page<Payment> paymentsPage = paymentRepository.findAll(pageable);
        return paymentsPage.map(this::convertToDto);
    }

    @Override
    public List<PaymentResponseDto> getAllPayments() {
        List<Payment> payments = paymentRepository.findAll();
        return payments.stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    @Transactional
    public PaymentResponseDto processOnSitePayment(ProcessOnSitePaymentRequestDto requestDto) {
        log.info("Processing on-site payment for session {} - user {} - amount {} - method {}", 
                requestDto.getSessionId(), requestDto.getUserId(), requestDto.getAmount(), requestDto.getPaymentMethod());
        
        // Tạo payment record với trạng thái completed (vì đã thanh toán tại chỗ)
        Payment payment = new Payment();
        payment.setSessionId(requestDto.getSessionId());
        payment.setUserId(requestDto.getUserId());
        payment.setAmount(requestDto.getAmount());
        
        // Parse payment method
        try {
            payment.setPaymentMethod(Payment.PaymentMethod.valueOf(requestDto.getPaymentMethod()));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid payment method: {}, defaulting to cash", requestDto.getPaymentMethod());
            payment.setPaymentMethod(Payment.PaymentMethod.cash);
        }
        
        // On-site payments (cash/QR) are immediately completed
        payment.setPaymentStatus(Payment.PaymentStatus.completed);
        payment.setPaymentTime(LocalDateTime.now());
        
        Payment savedPayment = paymentRepository.save(payment);
        log.info("On-site payment processed successfully. Payment ID: {}", savedPayment.getPaymentId());
        
        // Mark session as paid
        try {
            chargingServiceClient.markSessionAsPaid(savedPayment.getSessionId(), savedPayment.getPaymentId());
            log.info("Session {} marked as paid after on-site payment", savedPayment.getSessionId());
        } catch (Exception e) {
            log.error("Failed to mark session {} as paid: {}", savedPayment.getSessionId(), e.getMessage());
            // Continue even if marking fails - payment was still successful
        }
        
        return convertToDto(savedPayment);
    }

    @Override
    public List<PaymentResponseDto> getPaymentsBySessionId(Long sessionId) {
        List<Payment> payments = paymentRepository.findBySessionIdOrderByCreatedAtDesc(sessionId);
        return payments.stream()
                .map(this::convertToDto)
                .toList();
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