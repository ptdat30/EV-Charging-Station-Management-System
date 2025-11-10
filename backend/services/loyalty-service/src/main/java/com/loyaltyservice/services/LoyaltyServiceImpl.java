// src/main/java/com/loyaltyservice/services/LoyaltyServiceImpl.java
package com.loyaltyservice.services;

import com.loyaltyservice.dtos.LoyaltyAccountResponseDto;
import com.loyaltyservice.dtos.PointsTransactionResponseDto;
import com.loyaltyservice.dtos.RedeemPointsRequestDto;
import com.loyaltyservice.entities.LoyaltyAccount;
import com.loyaltyservice.entities.PointsTransaction;
import com.loyaltyservice.repositories.LoyaltyAccountRepository;
import com.loyaltyservice.repositories.PointsTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoyaltyServiceImpl implements LoyaltyService {

    private static final Logger log = LoggerFactory.getLogger(LoyaltyServiceImpl.class);
    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final PointsTransactionRepository pointsTransactionRepository;

    // Tier thresholds (lifetime points required)
    private static final Map<LoyaltyAccount.TierLevel, Integer> TIER_THRESHOLDS = new HashMap<>();
    static {
        TIER_THRESHOLDS.put(LoyaltyAccount.TierLevel.bronze, 0);
        TIER_THRESHOLDS.put(LoyaltyAccount.TierLevel.silver, 1000);
        TIER_THRESHOLDS.put(LoyaltyAccount.TierLevel.gold, 5000);
        TIER_THRESHOLDS.put(LoyaltyAccount.TierLevel.platinum, 15000);
        TIER_THRESHOLDS.put(LoyaltyAccount.TierLevel.diamond, 50000);
    }

    @Override
    public LoyaltyAccountResponseDto getAccountByUserId(Long userId) {
        log.info("Fetching loyalty account for user ID: {}", userId);
        
        LoyaltyAccount account = loyaltyAccountRepository.findByUserId(userId)
                .orElseGet(() -> {
                    log.info("No loyalty account found for user ID: {}. Creating new one.", userId);
                    return createNewAccount(userId);
                });
        
        return convertToDto(account);
    }

    @Override
    @Transactional
    public LoyaltyAccountResponseDto createAccount(Long userId) {
        log.info("Creating new loyalty account for user ID: {}", userId);
        
        // Check if account already exists
        if (loyaltyAccountRepository.findByUserId(userId).isPresent()) {
            log.warn("Loyalty account already exists for user ID: {}", userId);
            throw new RuntimeException("Loyalty account already exists for this user");
        }
        
        LoyaltyAccount account = createNewAccount(userId);
        return convertToDto(account);
    }

    @Override
    public List<PointsTransactionResponseDto> getTransactionsByUserId(Long userId) {
        log.info("Fetching points transactions for user ID: {}", userId);
        
        LoyaltyAccount account = loyaltyAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Loyalty account not found for user ID: " + userId));
        
        List<PointsTransaction> transactions = pointsTransactionRepository
                .findByAccountOrderByCreatedAtDesc(account);
        
        return transactions.stream()
                .map(this::convertTransactionToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LoyaltyAccountResponseDto redeemPoints(RedeemPointsRequestDto requestDto) {
        log.info("Redeeming {} points for user ID: {}", requestDto.getPoints(), requestDto.getUserId());
        
        LoyaltyAccount account = loyaltyAccountRepository.findByUserId(requestDto.getUserId())
                .orElseThrow(() -> new RuntimeException("Loyalty account not found for user ID: " + requestDto.getUserId()));
        
        // Check if user has enough points
        if (account.getPointsBalance() < requestDto.getPoints()) {
            throw new RuntimeException("Insufficient points. Available: " + account.getPointsBalance() 
                    + ", Required: " + requestDto.getPoints());
        }
        
        // Deduct points
        int newBalance = account.getPointsBalance() - requestDto.getPoints();
        account.setPointsBalance(newBalance);
        loyaltyAccountRepository.save(account);
        
        // Record transaction
        PointsTransaction transaction = new PointsTransaction();
        transaction.setAccount(account);
        transaction.setPoints(-requestDto.getPoints()); // Negative for redemption
        transaction.setType(PointsTransaction.TransactionType.redeem);
        transaction.setBalanceAfter(newBalance);
        transaction.setReferenceType(requestDto.getReferenceType());
        transaction.setReferenceId(requestDto.getReferenceId());
        transaction.setDescription(requestDto.getDescription());
        pointsTransactionRepository.save(transaction);
        
        log.info("Successfully redeemed {} points for user ID: {}. New balance: {}", 
                requestDto.getPoints(), requestDto.getUserId(), newBalance);
        
        return convertToDto(account);
    }

    // Helper methods
    private LoyaltyAccount createNewAccount(Long userId) {
        LoyaltyAccount account = new LoyaltyAccount();
        account.setUserId(userId);
        account.setPointsBalance(0);
        account.setLifetimePoints(0);
        account.setTierLevel(LoyaltyAccount.TierLevel.bronze);
        account.setTierProgress(0);
        account.setTierUpdatedAt(LocalDateTime.now());
        return loyaltyAccountRepository.save(account);
    }

    private LoyaltyAccountResponseDto convertToDto(LoyaltyAccount account) {
        LoyaltyAccountResponseDto dto = new LoyaltyAccountResponseDto();
        dto.setAccountId(account.getAccountId());
        dto.setUserId(account.getUserId());
        dto.setPointsBalance(account.getPointsBalance());
        dto.setLifetimePoints(account.getLifetimePoints());
        dto.setTierLevel(account.getTierLevel().name());
        dto.setTierProgress(account.getTierProgress());
        dto.setTierUpdatedAt(account.getTierUpdatedAt());
        dto.setCreatedAt(account.getCreatedAt());
        dto.setUpdatedAt(account.getUpdatedAt());
        
        // Calculate tier display name
        dto.setTierDisplayName(getTierDisplayName(account.getTierLevel()));
        
        // Calculate points to next tier
        LoyaltyAccount.TierLevel nextTier = getNextTier(account.getTierLevel());
        if (nextTier != null) {
            int pointsToNext = TIER_THRESHOLDS.get(nextTier) - account.getLifetimePoints();
            dto.setPointsToNextTier(Math.max(0, pointsToNext));
            dto.setNextTierLevel(nextTier.name());
        } else {
            dto.setPointsToNextTier(0);
            dto.setNextTierLevel(null);
        }
        
        return dto;
    }

    private PointsTransactionResponseDto convertTransactionToDto(PointsTransaction transaction) {
        PointsTransactionResponseDto dto = new PointsTransactionResponseDto();
        dto.setTransactionId(transaction.getTransactionId());
        dto.setAccountId(transaction.getAccount().getAccountId());
        dto.setPoints(transaction.getPoints());
        dto.setTransactionType(transaction.getType().name());
        dto.setBalanceAfter(transaction.getBalanceAfter());
        dto.setReferenceType(transaction.getReferenceType());
        dto.setReferenceId(transaction.getReferenceId());
        dto.setDescription(transaction.getDescription());
        dto.setExpiresAt(transaction.getExpiresAt());
        dto.setCreatedAt(transaction.getCreatedAt());
        return dto;
    }

    private String getTierDisplayName(LoyaltyAccount.TierLevel tier) {
        switch (tier) {
            case bronze: return "Đồng";
            case silver: return "Bạc";
            case gold: return "Vàng";
            case platinum: return "Bạch Kim";
            case diamond: return "Kim Cương";
            default: return tier.name();
        }
    }

    private LoyaltyAccount.TierLevel getNextTier(LoyaltyAccount.TierLevel currentTier) {
        switch (currentTier) {
            case bronze: return LoyaltyAccount.TierLevel.silver;
            case silver: return LoyaltyAccount.TierLevel.gold;
            case gold: return LoyaltyAccount.TierLevel.platinum;
            case platinum: return LoyaltyAccount.TierLevel.diamond;
            case diamond: return null; // Max tier
            default: return null;
        }
    }

    @Override
    @Transactional
    public LoyaltyAccountResponseDto recalculateTier(Long userId) {
        log.info("Recalculating tier for user ID: {}", userId);
        
        LoyaltyAccount account = loyaltyAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Loyalty account not found for user ID: " + userId));
        
        // Calculate tier based on lifetime points
        LoyaltyAccount.TierLevel oldTier = account.getTierLevel();
        LoyaltyAccount.TierLevel newTier = calculateTierLevel(account.getLifetimePoints());
        
        if (newTier != oldTier) {
            account.setTierLevel(newTier);
            account.setTierUpdatedAt(LocalDateTime.now());
            loyaltyAccountRepository.save(account);
            log.info("Tier updated for user ID: {} from {} to {}", userId, oldTier, newTier);
        } else {
            log.info("Tier unchanged for user ID: {}, current tier: {}", userId, oldTier);
        }
        
        return convertToDto(account);
    }
    
    /**
     * Calculate tier level based on lifetime points
     */
    private LoyaltyAccount.TierLevel calculateTierLevel(int lifetimePoints) {
        if (lifetimePoints >= 50000) {
            return LoyaltyAccount.TierLevel.diamond;
        } else if (lifetimePoints >= 15000) {
            return LoyaltyAccount.TierLevel.platinum;
        } else if (lifetimePoints >= 5000) {
            return LoyaltyAccount.TierLevel.gold;
        } else if (lifetimePoints >= 1000) {
            return LoyaltyAccount.TierLevel.silver;
        } else {
            return LoyaltyAccount.TierLevel.bronze;
        }
    }
}

