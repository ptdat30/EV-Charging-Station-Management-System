// FILE: WalletController.java
package com.chargingservice.controllers;

import com.chargingservice.dtos.CreateWalletRequestDto;
import com.chargingservice.entities.Wallet;
import com.chargingservice.services.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    // POST /api/wallets
    @PostMapping("")
    public ResponseEntity<Wallet> createWallet(@RequestBody CreateWalletRequestDto requestDto) {
        Wallet createdWallet = walletService.createWallet(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdWallet);
    }
}