// FILE: WalletController.java
package com.paymentservice.controllers;

import com.paymentservice.dtos.CreateWalletRequestDto;
import com.paymentservice.entities.Wallet;
import com.paymentservice.services.WalletService;
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