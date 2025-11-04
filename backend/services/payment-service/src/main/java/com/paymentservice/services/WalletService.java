// FILE: WalletService.java
package com.paymentservice.services;

import com.paymentservice.dtos.CreateWalletRequestDto;
import com.paymentservice.entities.Wallet; // Import Wallet entity

public interface WalletService {
    Wallet createWallet(CreateWalletRequestDto requestDto);
    Wallet getOrCreateWallet(Long userId);
    Wallet deposit(Long userId, java.math.BigDecimal amount);
    Wallet deduct(Long userId, java.math.BigDecimal amount);
}