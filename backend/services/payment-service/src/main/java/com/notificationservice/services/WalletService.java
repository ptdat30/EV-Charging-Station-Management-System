// FILE: WalletService.java
package com.notificationservice.services;

import com.notificationservice.dtos.CreateWalletRequestDto;
import com.notificationservice.entities.Wallet; // Import Wallet entity

public interface WalletService {
    Wallet createWallet(CreateWalletRequestDto requestDto);
}