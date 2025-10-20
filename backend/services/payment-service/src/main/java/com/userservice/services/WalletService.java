// FILE: WalletService.java
package com.userservice.services;

import com.userservice.dtos.CreateWalletRequestDto;
import com.userservice.entities.Wallet; // Import Wallet entity

public interface WalletService {
    Wallet createWallet(CreateWalletRequestDto requestDto);
}