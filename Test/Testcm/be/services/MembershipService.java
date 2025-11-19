package com.quitsmoking.services;

import com.quitsmoking.model.User;
import com.quitsmoking.reponsitories.UserDAO; // Đảm bảo đúng package của UserDAO
import com.quitsmoking.model.MembershipTransaction;
import com.quitsmoking.model.MembershipPlan;
import com.quitsmoking.model.MembershipPlanType;
import com.quitsmoking.reponsitories.MembershipPlanRepository;
import com.quitsmoking.reponsitories.MembershipTransactionRepository;
import com.quitsmoking.dto.request.MembershipUpgradeRequest;
import com.quitsmoking.dto.response.AuthResponse;
import com.quitsmoking.dto.response.PaymentResponse;
import com.quitsmoking.dto.response.UpgradeMembershipResponse;
import com.quitsmoking.exceptions.ResourceNotFoundException;
import com.quitsmoking.exceptions.BadRequestException;
import com.quitsmoking.model.Role;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.UUID;
import java.math.BigDecimal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Service quản lý gói thành viên và thanh toán
 */
@Service
@Transactional
public class MembershipService {

    private static final Logger logger = LoggerFactory.getLogger(MembershipService.class);

    @Autowired
    private UserDAO userDAO;

    @Autowired
    private MembershipPlanRepository membershipPlanRepository;

    @Autowired
    private MembershipTransactionRepository membershipTransactionRepository;

    @Autowired
    private EmailService emailService; // THÊM: Inject EmailService vào đây

    /**
     * Lấy thông tin gói thành viên hiện tại của người dùng
     */
    public User getCurrentMembership(String userId) {
        return userDAO.findByIdWithMembership(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
    }

    /**
     * Lấy danh sách các gói thành viên có sẵn (từ database)
     * Phương thức này sẽ lấy các gói thành viên (entity) đang hoạt động từ DB
     */
    public List<MembershipPlan> getAvailablePlans() {
        return membershipPlanRepository.findByIsActiveTrue();
    }

    public List<MembershipPlanType> getAllMembershipPlanTypes() {
        return List.of(MembershipPlanType.values());
    }

    /**
     * Đăng ký gói "Trãi Nghiệm" miễn phí cho người dùng.
     * Người dùng chỉ có thể đăng ký gói này một lần.
     */
    public User claimFreeMembership(String userId) {
        User user = getCurrentMembership(userId);

        if (user.isFreePlanClaimed()) {
            throw new BadRequestException("Bạn đã đăng ký gói 'Trãi Nghiệm' miễn phí này rồi và chỉ có thể đăng ký một lần.");
        }

        if (user.getRole() == Role.MEMBER) {
            throw new BadRequestException("Bạn đã là thành viên. Không thể đăng ký gói dùng thử.");
        }

        MembershipPlan freePlan = membershipPlanRepository.findByPlanType(MembershipPlanType.THIRTY_DAYS_TRIAL)
                .orElseThrow(() -> new ResourceNotFoundException("Gói 'Trãi Nghiệm' (THIRTY_DAYS_TRIAL) không tìm thấy trong hệ thống. Vui lòng liên hệ quản trị viên để cấu hình gói này."));

        if (freePlan.getPrice().compareTo(BigDecimal.ZERO) != 0) {
            throw new BadRequestException("Cấu hình gói 'Trãi Nghiệm' bị lỗi. Giá không phải là 0.");
        }

        user.setCurrentMembershipPlan(freePlan);
        user.setMembershipStartDate(LocalDate.now());
        user.setMembershipEndDate(LocalDate.now().plusDays(freePlan.getDurationDays()));
        user.setFreePlanClaimed(true);
        user.setRole(Role.MEMBER);

        User updatedUser = userDAO.save(user);

        MembershipTransaction transaction = new MembershipTransaction();
        transaction.setUser(user);
        transaction.setMembershipPlan(freePlan);
        transaction.setAmount(BigDecimal.ZERO);
        transaction.setDiscountAmount(BigDecimal.ZERO);
        transaction.setFinalAmount(BigDecimal.ZERO);
        transaction.setPaymentStatus(MembershipTransaction.PaymentStatus.COMPLETED);
        transaction.setTransactionType(MembershipTransaction.TransactionType.FREE_TRIAL);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setCompletedAt(LocalDateTime.now());

        membershipTransactionRepository.save(transaction);

        // THÊM: Gửi email xác nhận đăng ký gói miễn phí
        try {
            String subject = "Chào mừng đến với gói Trải Nghiệm QuitSmoking!";
            String body = String.format(
                    "Chào %s,\n\n" +
                            "Cảm ơn bạn đã đăng ký gói 'Trải Nghiệm' miễn phí của QuitSmoking! Bạn có %d ngày để khám phá các tính năng của chúng tôi.\n\n" +
                            "Để bắt đầu, hãy truy cập bảng điều khiển của bạn tại: http://your-app.com/dashboard\n\n" + // Thay thế bằng URL thực tế
                            "Chúc bạn thành công trên hành trình bỏ thuốc lá!\n\n" +
                            "Trân trọng,\n" +
                            "Đội ngũ QuitSmoking",
                    user.getFirstName(), freePlan.getDurationDays()
            );
            emailService.sendEmail(user.getEmail(), subject, body);
            logger.info("Đã gửi email xác nhận gói miễn phí cho: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Lỗi khi gửi email xác nhận gói miễn phí cho {}: {}", user.getEmail(), e.getMessage());
        }

        return updatedUser;
    }

    /**
     * Nâng cấp gói thành viên
     */
    @Transactional
    public UpgradeMembershipResponse upgradeMembership(String userId, MembershipUpgradeRequest request) {
        User user = getCurrentMembership(userId);

        MembershipPlan newPlan = membershipPlanRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Gói thành viên không hợp lệ hoặc không tìm thấy."));

        if (user.getCurrentMembershipPlan() != null && user.getCurrentMembershipPlan().getPlanType().getPriority() >= newPlan.getPlanType().getPriority()) {
            throw new BadRequestException("Bạn không thể nâng cấp xuống gói thấp hơn hoặc gói hiện tại.");
        }

        if (newPlan.getPlanType() == MembershipPlanType.THIRTY_DAYS_TRIAL) {
            throw new BadRequestException("Không thể nâng cấp lên gói 'Trải Nghiệm' thông qua chức năng nâng cấp. Vui lòng sử dụng chức năng đăng ký gói miễn phí.");
        }

        BigDecimal originalPrice = newPlan.getPrice();
        BigDecimal discountAmount = request.getDiscountCode() != null ?
                calculateDiscount(request.getDiscountCode(), originalPrice) : BigDecimal.ZERO;
        BigDecimal finalAmount = originalPrice.subtract(discountAmount);

        MembershipTransaction transaction = new MembershipTransaction();
        transaction.setUser(user);
        transaction.setMembershipPlan(newPlan);
        transaction.setAmount(originalPrice);
        transaction.setDiscountAmount(discountAmount);
        transaction.setFinalAmount(finalAmount);
        transaction.setPaymentStatus(MembershipTransaction.PaymentStatus.COMPLETED);
        transaction.setTransactionType(MembershipTransaction.TransactionType.UPGRADE);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setCompletedAt(LocalDateTime.now());
        transaction.setPaymentGatewayReference("DIRECT_UPGRADE_NO_PAYMENT_" + UUID.randomUUID().toString());
        membershipTransactionRepository.save(transaction);

        user.setCurrentMembershipPlan(newPlan);
        if (user.getMembershipEndDate() != null && user.getMembershipEndDate().isAfter(LocalDate.now())) {
            user.setMembershipStartDate(user.getMembershipEndDate()); // Bắt đầu gói mới ngay sau khi gói cũ kết thúc
            user.setMembershipEndDate(user.getMembershipEndDate().plusDays(newPlan.getDurationDays()));
        } else {
            user.setMembershipStartDate(LocalDate.now());
            user.setMembershipEndDate(LocalDate.now().plusDays(newPlan.getDurationDays()));
        }
        user.setRole(Role.MEMBER);
        User savedUser = userDAO.save(user);

        User fullyLoadedUser = userDAO.findByIdWithMembership(savedUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found after update: " + savedUser.getId()));

        logger.info("Đã tạo giao dịch nâng cấp gói {} cho user {}. Final Amount: {}", newPlan.getPlanName(), userId, finalAmount);

        // THÊM: Gửi email xác nhận nâng cấp gói
        try {
            String subject = "Chúc mừng! Gói thành viên QuitSmoking của bạn đã được nâng cấp!";
            String body = String.format(
                    "Chào %s,\n\n" +
                            "Gói thành viên của bạn đã được nâng cấp thành công lên gói '%s'.\n" +
                            "Bạn có thể xem chi tiết gói của mình tại: http://localhost:4173/membership\n\n" + // Thay thế bằng URL thực tế
                            "Cảm ơn bạn đã tin tưởng QuitSmoking!\n\n" +
                            "Trân trọng,\n" +
                            "Đội ngũ QuitSmoking",
                    user.getFirstName(), newPlan.getPlanName()
            );
            emailService.sendEmail(user.getEmail(), subject, body);
            logger.info("Đã gửi email xác nhận nâng cấp gói cho: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Lỗi khi gửi email xác nhận nâng cấp gói cho {}: {}", user.getEmail(), e.getMessage());
        }


        PaymentResponse paymentResponse = new PaymentResponse();
        paymentResponse.setTransactionId(transaction.getId());
        paymentResponse.setPaymentUrl("N/A - Direct Upgrade");
        paymentResponse.setStatus(transaction.getPaymentStatus().name());
        paymentResponse.setAmount(finalAmount);
        paymentResponse.setMembershipPlan(newPlan.getPlanName());

        AuthResponse authResponse = new AuthResponse(null, fullyLoadedUser);

        UpgradeMembershipResponse upgradeMembershipResponse = new UpgradeMembershipResponse();
        upgradeMembershipResponse.setPaymentResponse(paymentResponse);
        upgradeMembershipResponse.setAuthResponse(authResponse);

        return upgradeMembershipResponse;
    }


    /**
     * Phương thức xử lý callback từ cổng thanh toán sau khi thanh toán thành công.
     * Cần được gọi bởi một webhook hoặc endpoint sau khi cổng thanh toán xác nhận thành công.
     */
    @Transactional
    public User completePaymentAndActivateMembership(String transactionId, String paymentGatewayReference) {
        MembershipTransaction transaction = membershipTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Giao dịch không tìm thấy với ID: " + transactionId));

        if (transaction.getPaymentStatus() == MembershipTransaction.PaymentStatus.COMPLETED) {
            logger.warn("Giao dịch {} đã ở trạng thái COMPLETED. Không cần xử lý lại.", transactionId);
            return transaction.getUser();
        }

        if (!transaction.getPaymentStatus().equals(MembershipTransaction.PaymentStatus.PENDING)) {
            logger.warn("Giao dịch {} không ở trạng thái PENDING. Trạng thái hiện tại: {}", transactionId, transaction.getPaymentStatus());
            throw new BadRequestException("Giao dịch này không hợp lệ để hoàn thành.");
        }

        transaction.setPaymentStatus(MembershipTransaction.PaymentStatus.COMPLETED);
        transaction.setCompletedAt(LocalDateTime.now());
        transaction.setPaymentGatewayReference(paymentGatewayReference);
        membershipTransactionRepository.save(transaction);

        User user = transaction.getUser();
        MembershipPlan plan = transaction.getMembershipPlan();

        user.setCurrentMembershipPlan(plan);
        if (user.getMembershipEndDate() != null && user.getMembershipEndDate().isAfter(LocalDate.now())) {
            user.setMembershipEndDate(user.getMembershipEndDate().plusDays(plan.getDurationDays()));
        } else {
            user.setMembershipEndDate(LocalDate.now().plusDays(plan.getDurationDays()));
        }
        user.setRole(Role.MEMBER);

        User updatedUser = userDAO.save(user);
        logger.info("Giao dịch {} hoàn thành. Gói thành viên {} đã được kích hoạt cho user {}", transactionId, plan.getPlanName(), user.getId());

        // THÊM: Gửi email xác nhận thanh toán/kích hoạt
        try {
            String subject = "Gói thành viên QuitSmoking của bạn đã được kích hoạt!";
            String body = String.format(
                    "Chào %s,\n\n" +
                            "Gói thành viên '%s' của bạn đã được kích hoạt thành công!\n" +
                            "Chi tiết giao dịch: ID %s, Số tiền: %s %s.\n\n" +
                            "Bạn có thể truy cập các tính năng cao cấp ngay bây giờ tại: http://localhost:4173/profile\n\n" + // Thay thế bằng URL thực tế
                            "Cảm ơn bạn đã tin tưởng QuitSmoking!\n\n" +
                            "Trân trọng,\n" +
                            "Đội ngũ QuitSmoking",
                    user.getFirstName(), plan.getPlanName(), transaction.getId(), transaction.getFinalAmount(), "VND" // Hoặc đơn vị tiền tệ khác
            );
            emailService.sendEmail(user.getEmail(), subject, body);
            logger.info("Đã gửi email xác nhận kích hoạt gói cho: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Lỗi khi gửi email xác nhận kích hoạt gói cho {}: {}", user.getEmail(), e.getMessage());
        }

        return updatedUser;
    }

    // --- Các phương thức khác ---

    private BigDecimal calculateDiscount(String discountCode, BigDecimal originalPrice) {
        if ("DISCOUNT10".equals(discountCode)) {
            return originalPrice.multiply(BigDecimal.valueOf(0.10));
        }
        return BigDecimal.ZERO;
    }

    public User getUserWithMembership(String userId) {
        return userDAO.findByIdWithMembership(userId).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<MembershipTransaction> getMembershipTransactions(String userId) {
        return membershipTransactionRepository.findByUser_Id(userId);
    }

    @Transactional(readOnly = true)
    public MembershipTransaction checkPaymentStatus(String userId, String transactionId) {
        MembershipTransaction transaction = membershipTransactionRepository.findByIdAndUser_Id(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giao dịch với ID: " + transactionId));

        if (!transaction.getUser().getId().equals(userId)) {
            throw new BadRequestException("Giao dịch không thuộc về người dùng này.");
        }
        return transaction;
    }

    public User cancelMembership(String userId) {
        User user = getCurrentMembership(userId);
        MembershipPlan defaultFreePlan = membershipPlanRepository.findByPlanType(MembershipPlanType.THIRTY_DAYS_TRIAL)
                .orElseThrow(() -> new ResourceNotFoundException("Gói 'Trãi Nghiệm' mặc định không tìm thấy. Vui lòng liên hệ quản trị viên để cấu hình gói này."));
        user.setCurrentMembershipPlan(defaultFreePlan);
        user.setMembershipEndDate(null);
        return userDAO.save(user);
    }

    public PaymentResponse renewMembership(String userId, MembershipUpgradeRequest request) {
        User user = getCurrentMembership(userId);
        MembershipPlan newPlan = membershipPlanRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Gói thành viên không hợp lệ."));

        if (user.getCurrentMembershipPlan() == null || !user.getCurrentMembershipPlan().getId().equals(newPlan.getId())) {
            throw new BadRequestException("Bạn chỉ có thể gia hạn gói hiện tại.");
        }

        BigDecimal planPrice = newPlan.getPrice();
        BigDecimal discountAmount = request.getDiscountCode() != null ?
                calculateDiscount(request.getDiscountCode(), planPrice) : BigDecimal.ZERO;

        MembershipTransaction transaction = new MembershipTransaction();
        transaction.setUser(user);
        transaction.setMembershipPlan(newPlan);
        transaction.setAmount(planPrice);
        transaction.setDiscountAmount(discountAmount);
        transaction.setFinalAmount(transaction.getAmount().subtract(transaction.getDiscountAmount()));
        transaction.setPaymentStatus(MembershipTransaction.PaymentStatus.COMPLETED);
        transaction.setTransactionType(MembershipTransaction.TransactionType.RENEWAL);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setCompletedAt(LocalDateTime.now());
        transaction.setPaymentGatewayReference("DIRECT_RENEWAL_NO_PAYMENT_" + UUID.randomUUID().toString());
        membershipTransactionRepository.save(transaction);

        if (user.getMembershipEndDate() != null && user.getMembershipEndDate().isAfter(LocalDate.now())) {
            user.setMembershipEndDate(user.getMembershipEndDate().plusDays(newPlan.getDurationDays()));
        } else {
            user.setMembershipEndDate(LocalDate.now().plusDays(newPlan.getDurationDays()));
        }
        userDAO.save(user);

        // THÊM: Gửi email xác nhận gia hạn gói
        try {
            String subject = "Gói thành viên QuitSmoking của bạn đã được gia hạn thành công!";
            String body = String.format(
                    "Chào %s,\n\n" +
                            "Gói thành viên '%s' của bạn đã được gia hạn.\n" +
                            "Gói của bạn hiện có hiệu lực đến ngày: %s.\n\n" + // user.getMembershipEndDate() có thể cần định dạng
                            "Cảm ơn bạn đã tiếp tục đồng hành cùng QuitSmoking!\n\n" +
                            "Trân trọng,\n" +
                            "Đội ngũ QuitSmoking",
                    user.getFirstName(), newPlan.getPlanName(), user.getMembershipEndDate() != null ? user.getMembershipEndDate().toString() : "N/A"
            );
            emailService.sendEmail(user.getEmail(), subject, body);
            logger.info("Đã gửi email xác nhận gia hạn gói cho: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Lỗi khi gửi email xác nhận gia hạn gói cho {}: {}", user.getEmail(), e.getMessage());
        }

        PaymentResponse response = new PaymentResponse();
        response.setTransactionId(transaction.getId());
        response.setPaymentUrl("N/A - Direct Renewal");
        response.setStatus(transaction.getPaymentStatus().name());
        response.setAmount(transaction.getFinalAmount());
        response.setMembershipPlan(newPlan.getPlanName());
        return response;
    }

    public List<Object> getAvailableDiscounts(String userId) {
        List<Object> discounts = new ArrayList<>();
        return discounts;
    }

    public Object applyDiscount(String userId, String discountCode) {
        return "Mã giảm giá đã được áp dụng: " + discountCode;
    }

    public User getUserById(String userId) {
        return userDAO.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }
}