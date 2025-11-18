package com.quitsmoking.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;
/**
 * DTO cho yêu cầu nâng cấp gói thành viên
 */
@Data
public class MembershipUpgradeRequest {
    @NotBlank(message = "ID gói thành viên không được để trống")
    private String planId;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod;

    @NotNull(message = "Số tiền không được để trống")

    @Positive(message = "Số tiền phải lớn hơn 0")

    private BigDecimal amount;
    private String discountCode;
    private String returnUrl;
    private String cancelUrl;
    // Thông tin bổ sung cho một số phương thức thanh toán
    private String bankCode;
    private String cardType;
    private String customerInfo;
}