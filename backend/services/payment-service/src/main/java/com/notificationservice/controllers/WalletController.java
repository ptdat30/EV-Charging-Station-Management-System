// FILE: WalletController.java
package com.notificationservice.controllers;

import com.notificationservice.dtos.CreateWalletRequestDto;
import com.notificationservice.entities.Wallet;
import com.notificationservice.services.WalletService;
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