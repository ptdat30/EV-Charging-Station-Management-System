// src/main/java/com/loyaltyservice/services/LoyaltyService.java
package com.loyaltyservice.services;

import com.loyaltyservice.dtos.LoyaltyAccountResponseDto;
import com.loyaltyservice.dtos.PointsTransactionResponseDto;
import com.loyaltyservice.dtos.RedeemPointsRequestDto;

import java.util.List;

public interface LoyaltyService {
    LoyaltyAccountResponseDto getAccountByUserId(Long userId);
    LoyaltyAccountResponseDto createAccount(Long userId);
    List<PointsTransactionResponseDto> getTransactionsByUserId(Long userId);
    LoyaltyAccountResponseDto redeemPoints(RedeemPointsRequestDto requestDto);
    LoyaltyAccountResponseDto recalculateTier(Long userId);
}

