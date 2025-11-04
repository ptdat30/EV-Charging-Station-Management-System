// FILE: PackageServiceImpl.java
package com.userservice.services;

import com.userservice.clients.WalletServiceClient;
import com.userservice.dtos.PurchasePackageRequestDto;
import com.userservice.dtos.UpdateSubscriptionRequestDto;
import com.userservice.dtos.UserResponseDto;
import com.userservice.entities.User;
import com.userservice.exceptions.ResourceNotFoundException;
import com.userservice.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PackageServiceImpl implements PackageService {

    private static final Logger log = LoggerFactory.getLogger(PackageServiceImpl.class);
    private final UserRepository userRepository;
    private final WalletServiceClient walletServiceClient;

    // Giá cố định của các gói
    private static final BigDecimal SILVER_PRICE = new BigDecimal("299000");
    private static final BigDecimal GOLD_PRICE = new BigDecimal("599000");
    private static final BigDecimal PLATINUM_PRICE = new BigDecimal("999000");
    private static final int SUBSCRIPTION_DURATION_DAYS = 30;

    @Override
    @Transactional
    public UserResponseDto purchasePackage(Long userId, PurchasePackageRequestDto requestDto) {
        log.info("Processing package purchase - userId: {}, packageType: {}", userId, requestDto.getPackageType());

        // 1. Tìm user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // 2. Validate package type
        User.SubscriptionPackage packageType;
        try {
            packageType = User.SubscriptionPackage.valueOf(requestDto.getPackageType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid package type: " + requestDto.getPackageType());
        }

        // 3. Lấy giá gói
        BigDecimal packagePrice = getPackagePrice(packageType);

        // 4. Kiểm tra số dư ví
        Map<String, Object> balanceResponse = walletServiceClient.getBalance(userId);
        BigDecimal balance = new BigDecimal(balanceResponse.get("balance").toString());
        
        if (balance.compareTo(packagePrice) < 0) {
            throw new RuntimeException("Insufficient balance. Required: " + packagePrice + ", Available: " + balance);
        }

        // 5. Trừ tiền từ ví
        try {
            walletServiceClient.deduct(userId, packagePrice);
            log.info("Deducted {} from wallet for user {}", packagePrice, userId);
        } catch (Exception e) {
            log.error("Error deducting from wallet", e);
            throw new RuntimeException("Failed to process payment: " + e.getMessage());
        }

        // 6. Cập nhật subscription cho user
        user.setSubscriptionPackage(packageType);
        user.setSubscriptionExpiresAt(LocalDateTime.now().plusDays(SUBSCRIPTION_DURATION_DAYS));
        
        User savedUser = userRepository.save(user);
        log.info("Package {} purchased successfully for user {}", packageType, userId);

        // 7. Convert to DTO
        return convertToDto(savedUser);
    }

    @Override
    @Transactional
    public UserResponseDto updateUserSubscription(Long userId, UpdateSubscriptionRequestDto requestDto) {
        log.info("Admin updating subscription - userId: {}, packageType: {}", userId, requestDto.getPackageType());

        // 1. Tìm user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // 2. Cập nhật subscription
        if (requestDto.getPackageType() == null || requestDto.getPackageType().isEmpty()) {
            // Xóa subscription
            user.setSubscriptionPackage(null);
            user.setSubscriptionExpiresAt(null);
        } else {
            // Cập nhật subscription
            User.SubscriptionPackage packageType;
            try {
                packageType = User.SubscriptionPackage.valueOf(requestDto.getPackageType().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid package type: " + requestDto.getPackageType());
            }
            
            user.setSubscriptionPackage(packageType);
            
            // Set expiresAt
            if (requestDto.getExpiresAt() != null) {
                user.setSubscriptionExpiresAt(requestDto.getExpiresAt());
            } else {
                user.setSubscriptionExpiresAt(LocalDateTime.now().plusDays(SUBSCRIPTION_DURATION_DAYS));
            }
        }

        User savedUser = userRepository.save(user);
        log.info("Subscription updated successfully for user {}", userId);

        return convertToDto(savedUser);
    }

    private BigDecimal getPackagePrice(User.SubscriptionPackage packageType) {
        switch (packageType) {
            case SILVER:
                return SILVER_PRICE;
            case GOLD:
                return GOLD_PRICE;
            case PLATINUM:
                return PLATINUM_PRICE;
            default:
                throw new IllegalArgumentException("Unknown package type: " + packageType);
        }
    }

    private UserResponseDto convertToDto(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setUserId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setFullName(user.getFullName());
        dto.setUserType(user.getUserType());
        dto.setStatus(user.getStatus());
        dto.setSubscriptionPackage(user.getSubscriptionPackage());
        dto.setSubscriptionExpiresAt(user.getSubscriptionExpiresAt());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}

