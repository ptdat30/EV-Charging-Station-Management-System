// FILE: WalletService.java
package com.chargingservice.services;

import com.chargingservice.dtos.CreateWalletRequestDto;
import com.chargingservice.entities.Wallet; // Import Wallet entity

public interface WalletService {
    Wallet createWallet(CreateWalletRequestDto requestDto);
}