// FILE: WalletServiceImpl.java
package com.userservice.services;

import com.userservice.dtos.CreateWalletRequestDto;
import com.userservice.entities.Wallet;
import com.userservice.repositories.WalletRepository;
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
}