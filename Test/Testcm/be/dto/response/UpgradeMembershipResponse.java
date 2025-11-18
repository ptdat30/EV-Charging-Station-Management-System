package com.quitsmoking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpgradeMembershipResponse {
    private PaymentResponse paymentResponse;
    private AuthResponse authResponse;
}
