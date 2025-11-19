package com.quitsmoking.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Base64;

@Service
public class EncryptionService {
    
    @Value("${app.encryption.secret:defaultSecretKey123}")
    private String secretKey;
    
    private static final String ALGORITHM = "AES";
    
    /**
     * Mã hóa text sử dụng AES
     */
    public String encrypt(String text) {
        try {
            SecretKeySpec secretKeySpec = generateKey();
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec);
            byte[] encryptedBytes = cipher.doFinal(text.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi mã hóa tin nhắn", e);
        }
    }
    
    /**
     * Giải mã text sử dụng AES
     */
    public String decrypt(String encryptedText) {
        try {
            SecretKeySpec secretKeySpec = generateKey();
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec);
            byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedText));
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi giải mã tin nhắn", e);
        }
    }
    
    /**
     * Tạo secret key từ secret string
     */
    private SecretKeySpec generateKey() throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(secretKey.getBytes(StandardCharsets.UTF_8));
        byte[] key = Arrays.copyOf(hash, 16); // AES requires 16 bytes
        return new SecretKeySpec(key, ALGORITHM);
    }
    
    /**
     * Kiểm tra xem text có phải là encrypted không
     */
    public boolean isEncrypted(String text) {
        if (text == null || text.isEmpty()) {
            return false;
        }
        try {
            // Thử decode base64
            Base64.getDecoder().decode(text);
            // Nếu thành công, có thể là encrypted
            return true;
        } catch (IllegalArgumentException e) {
            // Nếu không decode được, có thể là plain text
            return false;
        }
    }
} 