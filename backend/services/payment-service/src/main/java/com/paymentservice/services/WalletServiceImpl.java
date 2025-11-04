// FILE: WalletServiceImpl.java
package com.paymentservice.services;

import com.paymentservice.dtos.CreateWalletRequestDto;
import com.paymentservice.entities.Wallet;
import com.paymentservice.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;

    @Override
    public Wallet createWallet(CreateWalletRequestDto requestDto) {
        // Kiểm tra xem user đã có ví chưa
        if (walletRepository.findByUserId(requestDto.getUserId()).isPresent()) {
            throw new IllegalStateException("Wallet already exists for user ID: " + requestDto.getUserId());
        }

        Wallet newWallet = new Wallet();
        newWallet.setUserId(requestDto.getUserId());
        newWallet.setBalance(requestDto.getInitialBalance());
        newWallet.setStatus(Wallet.WalletStatus.active);

        return walletRepository.save(newWallet);
    }

    @Override
    public Wallet getOrCreateWallet(Long userId) {
        return walletRepository.findByUserId(userId).orElseGet(() -> {
            Wallet w = new Wallet();
            w.setUserId(userId);
            w.setBalance(java.math.BigDecimal.ZERO);
            w.setStatus(Wallet.WalletStatus.active);
            return walletRepository.save(w);
        });
    }

    @Override
    public Wallet deposit(Long userId, java.math.BigDecimal amount) {
        if (amount == null || amount.signum() <= 0) throw new IllegalArgumentException("Amount must be positive");
        Wallet wallet = getOrCreateWallet(userId);
        wallet.setBalance(wallet.getBalance().add(amount));
        return walletRepository.save(wallet);
    }

    @Override
    public Wallet deduct(Long userId, java.math.BigDecimal amount) {
        if (amount == null || amount.signum() <= 0) throw new IllegalArgumentException("Amount must be positive");
        Wallet wallet = getOrCreateWallet(userId);
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient balance. Required: " + amount + ", Available: " + wallet.getBalance());
        }
        wallet.setBalance(wallet.getBalance().subtract(amount));
        return walletRepository.save(wallet);
    }
}