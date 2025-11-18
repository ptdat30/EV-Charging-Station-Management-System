package com.quitsmoking.controllers;
import com.quitsmoking.model.User;
import com.quitsmoking.model.MembershipTransaction;
import com.quitsmoking.services.MembershipService;
import com.quitsmoking.dto.request.MembershipUpgradeRequest;
import com.quitsmoking.dto.response.AuthResponse;
import com.quitsmoking.dto.response.PaymentResponse;
import com.quitsmoking.dto.response.UpgradeMembershipResponse;
import com.quitsmoking.exceptions.ResourceNotFoundException;
import com.quitsmoking.exceptions.BadRequestException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;
/**
 * Controller quản lý gói thành viên
 */
@RestController
@RequestMapping("/api/membership")
@CrossOrigin(origins = "*")
public class MembershipController {
    private static final Logger logger = LoggerFactory.getLogger(MembershipController.class);
    @Autowired
    private MembershipService membershipService;

    @Autowired
    public MembershipController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    /**
     * Lấy thông tin gói thành viên hiện tại
     */
    @GetMapping("/current")
    public ResponseEntity<User> getCurrentMembership(@AuthenticationPrincipal User user) {
        User currentUser = membershipService.getCurrentMembership(user.getId());
        return ResponseEntity.ok(currentUser);
    }
    /**
     * Lấy danh sách các gói thành viên khả dụng
     */
    @PostMapping("/free-trial")
    public ResponseEntity<?> claimFreeMembership(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Người dùng chưa được xác thực."));
        }
        try {
            User updatedUser = membershipService.claimFreeMembership(user.getId());
            // --- THAY ĐỔI Ở ĐÂY: Tạo AuthResponse từ updatedUser ---
            // token là null vì đây không phải là đăng nhập/đăng ký mới, chỉ là cập nhật thông tin user
            AuthResponse authResponse = new AuthResponse(null, updatedUser);
            logger.info("Đăng ký gói miễn phí thành công. Trả về thông tin người dùng đã cập nhật qua AuthResponse: Vai trò={}, Gói thành viên={}",
                         updatedUser.getRole(), updatedUser.getCurrentMembershipPlan() != null ? updatedUser.getCurrentMembershipPlan().getPlanName() : "None");
            return ResponseEntity.ok(authResponse);
        } catch (ResourceNotFoundException | BadRequestException e) {
            logger.error("Lỗi khi đăng ký gói miễn phí cho người dùng {}: {}", user.getId(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Lỗi server nội bộ khi đăng ký gói miễn phí cho người dùng {}: {}", user.getId(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * Nâng cấp gói thành viên
     */
    @PostMapping("/upgrade")
    public ResponseEntity<AuthResponse> upgradeMembership(@AuthenticationPrincipal User authenticatedUser,
                                                        @Valid @RequestBody MembershipUpgradeRequest request) {
        if (authenticatedUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse("Người dùng chưa được xác thực."));
        }
        try {
        UpgradeMembershipResponse serviceResult = membershipService.upgradeMembership(authenticatedUser.getId(), request);

        // Lấy AuthResponse đã được tạo sẵn từ service
        AuthResponse authResponse = serviceResult.getAuthResponse();

        logger.info("Nâng cấp gói thành công cho user {}. Trả về thông tin người dùng đã cập nhật qua AuthResponse: Vai trò={}, Gói thành viên={}",
                        authResponse.getUserId(), // Lấy userId từ AuthResponse DTO (là String)
                        authResponse.getRole(),   // Lấy role từ AuthResponse DTO (là String)
                        authResponse.getMembership() != null ? authResponse.getMembership().getPlanName() : "None");

        return ResponseEntity.ok(authResponse);


        } catch (BadRequestException e) {
            logger.error("Yêu cầu không hợp lệ khi nâng cấp gói thành viên cho người dùng {}: {}", authenticatedUser.getId(), e.getMessage());
            return ResponseEntity.badRequest().body(new AuthResponse(e.getMessage()));
        } catch (ResourceNotFoundException e) {
            logger.error("Không tìm thấy tài nguyên khi nâng cấp gói thành viên cho người dùng {}: {}", authenticatedUser.getId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new AuthResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Lỗi server nội bộ khi nâng cấp gói thành viên cho người dùng {}: {}", authenticatedUser.getId(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new AuthResponse("Lỗi server: " + e.getMessage()));
        }
    }
    /**
     * Lấy lịch sử giao dịch membership
     */
    @GetMapping("/transactions")
    public ResponseEntity<List<MembershipTransaction>> getMembershipTransactions(
            @AuthenticationPrincipal User user) {
        
        List<MembershipTransaction> transactions = membershipService.getMembershipTransactions(user.getId());
        return ResponseEntity.ok(transactions);
    }
    /**
     * Kiểm tra trạng thái thanh toán
     */
    @GetMapping("/payment-status/{transactionId}")
    public ResponseEntity<MembershipTransaction> checkPaymentStatus(
            @AuthenticationPrincipal User user,
            @PathVariable String transactionId) {
        
        MembershipTransaction transaction = membershipService.checkPaymentStatus(user.getId(), transactionId);
        return ResponseEntity.ok(transaction);
    }
    /**
     * Hủy gói thành viên (downgrade về FREE)
     */
    @PostMapping("/cancel")
    public ResponseEntity<User> cancelMembership(@AuthenticationPrincipal User user) {
        User updatedUser = membershipService.cancelMembership(user.getId());
        return ResponseEntity.ok(updatedUser);
    }
    /**
     * Gia hạn gói thành viên
     */
    @PostMapping("/renew")
    public ResponseEntity<PaymentResponse> renewMembership(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody MembershipUpgradeRequest request) {
        
        PaymentResponse response = membershipService.renewMembership(user.getId(), request);
        return ResponseEntity.ok(response);
    }
    /**
     * Kiểm tra ưu đãi/discount
     */
    @GetMapping("/discounts")
    public ResponseEntity<List<Object>> getAvailableDiscounts(@AuthenticationPrincipal User user) {
        List<Object> discounts = membershipService.getAvailableDiscounts(user.getId());
        return ResponseEntity.ok(discounts);
    }
    /**
     * Áp dụng mã giảm giá
     */
    @PostMapping("/apply-discount")
    public ResponseEntity<Object> applyDiscount(
            @AuthenticationPrincipal User user,
            @RequestBody String discountCode) {
        
        Object discount = membershipService.applyDiscount(user.getId(), discountCode);
        return ResponseEntity.ok(discount);
    }
}