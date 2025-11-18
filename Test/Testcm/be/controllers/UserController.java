package com.quitsmoking.controllers;

import com.quitsmoking.model.User;
import com.quitsmoking.reponsitories.UserDAO;
import com.quitsmoking.dto.request.UpdateProfileRequest;
import com.quitsmoking.services.UserStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:4173", "http://localhost:3000", "http://localhost:5173"})
public class UserController {
    private boolean isUrl(String str) {
        return str != null && (str.startsWith("http://") || str.startsWith("https://"));
    }

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserDAO userDAO;
    private final UserStatusService userStatusService;

    @Autowired
    public UserController(UserDAO userDAO, UserStatusService userStatusService) {
        this.userDAO = userDAO;
        this.userStatusService = userStatusService;
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()") // Yêu cầu người dùng phải được xác thực để truy cập
    @Transactional
    public ResponseEntity<?> getUserProfile() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

            String identifier; // Đây sẽ là username hoặc email mà người dùng đã dùng để đăng nhập
            if (principal instanceof UserDetails) {
                identifier = ((UserDetails) principal).getUsername();
            } else if (principal instanceof User) {
                // Nếu bạn đã tùy chỉnh Spring Security để Principal là User entity của bạn
                // và ID là định danh chính, thì sử dụng getId().
                // Nếu UserDetails vẫn trả về username/email, thì hãy giữ nguyên logic UserDetails.
                identifier = ((User) principal).getId(); // Chỉ dùng nếu User.getId() khớp với Principal.getName()
            } else {
                logger.warn("Unexpected principal type: {}", principal.getClass().getName());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Không thể xác định người dùng đã xác thực."));
            }

            // --- ĐIỂM CHỈNH SỬA QUAN TRỌNG NHẤT ---
            // SỬ DỤNG findByEmailOrUsername CỦA BẠN!
            User user = userDAO.findByEmailOrUsernameWithMembership(identifier)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với định danh: " + identifier));

            // Track user HTTP activity for online status
            userStatusService.userHttpActivity(user.getId());

            // Tạo Map chứa thông tin profile
            Map<String, Object> profile = new HashMap<>();
            profile.put("id", user.getId());
            profile.put("username", user.getUsername());
            profile.put("email", user.getEmail());
            profile.put("firstName", user.getFirstName());
            profile.put("lastName", user.getLastName());
            profile.put("role", user.getRole().name());
            profile.put("pictureUrl", user.getPictureUrl());
            profile.put("phoneNumber", user.getPhoneNumber());
            profile.put("gender", user.getGender());
            profile.put("dateOfBirth", user.getDateOfBirth());

            // Thêm membership (gói thành viên) vào profile
            if (user.getCurrentMembershipPlan() != null) {
                Map<String, Object> membership = new HashMap<>();
                membership.put("id", user.getCurrentMembershipPlan().getId());
                membership.put("planName", user.getCurrentMembershipPlan().getPlanName());
                membership.put("durationDays", user.getCurrentMembershipPlan().getDurationDays());
                membership.put("price", user.getCurrentMembershipPlan().getPrice());
                membership.put("planType", user.getCurrentMembershipPlan().getPlanType() != null ? user.getCurrentMembershipPlan().getPlanType().name() : null);
                membership.put("description", user.getCurrentMembershipPlan().getDescription());
                membership.put("isActive", user.getCurrentMembershipPlan().getIsActive());
                membership.put("createdAt", user.getCurrentMembershipPlan().getCreatedAt());
                membership.put("updatedAt", user.getCurrentMembershipPlan().getUpdatedAt());
                membership.put("membershipStartDate", user.getMembershipStartDate());
                membership.put("membershipEndDate", user.getMembershipEndDate());
                // Thêm các trường khác nếu cần
                profile.put("membership", membership);
            } else {
                profile.put("membership", null);
            }

            // Thêm ngày hết hạn gói thành viên
            profile.put("membershipEndDate", user.getMembershipEndDate());

            logger.info("Đã lấy thành công profile người dùng: {}", user.getUsername());
            return ResponseEntity.ok(profile);

        } catch (UsernameNotFoundException e) {
            logger.warn("Yêu cầu profile người dùng nhưng không tìm thấy: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Lỗi khi lấy profile người dùng đã xác thực: {}", e.getMessage(), e);
            // Log chi tiết lỗi (stack trace) để dễ debug hơn
            e.printStackTrace(); // In stack trace ra console/log
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Đã xảy ra lỗi nội bộ khi lấy profile người dùng. Vui lòng thử lại sau."));
        }
    }

    @PutMapping(value = "/profile", consumes = {"multipart/form-data"})
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<?> updateUserProfile(
    @ModelAttribute UpdateProfileRequest request,
    @RequestParam(value = "avatar", required = false) MultipartFile avatar
    ) {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String identifier;
            if (principal instanceof UserDetails) {
                identifier = ((UserDetails) principal).getUsername();
            } else if (principal instanceof User) {
                identifier = ((User) principal).getId();
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Không thể xác định người dùng đã xác thực."));
            }

            User user = userDAO.findByEmailOrUsername(identifier)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với định danh: " + identifier));

            // Track user HTTP activity for online status
            userStatusService.userHttpActivity(user.getId());

            // Cập nhật các trường
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEmail(request.getEmail());
            user.setPhoneNumber(request.getPhoneNumber());
            user.setGender(request.getGender());
            user.setDateOfBirth(request.getDateOfBirth());
            

            // Xử lý file avatar nếu muốn lưu ảnh cũ
            // if (avatar != null && !avatar.isEmpty()) {
            //     String fileName = user.getId() + "_" + avatar.getOriginalFilename();
            //     String uploadDir = "uploads/avatars/";
            //     Path uploadPath = Paths.get(uploadDir);
            //     if (!Files.exists(uploadPath)) {
            //         Files.createDirectories(uploadPath);
            //     }
            //     Path filePath = uploadPath.resolve(fileName);
            //     avatar.transferTo(filePath.toFile());
            //     user.setPictureUrl("/" + uploadDir + fileName);
            // }

            // Xử lý file avatar nếu chỉ muốn lưu 1 ảnh duy nhất cho mỗi người dùng
            if (avatar != null && !avatar.isEmpty()) {
                // XÓA ẢNH CŨ nếu có và chỉ khi KHÔNG phải là URL
                String oldPictureUrl = user.getPictureUrl();
                if (oldPictureUrl != null && !oldPictureUrl.isEmpty() && !isUrl(oldPictureUrl)) {
                    Path oldFilePath = Paths.get("." + oldPictureUrl);
                    try {
                        Files.deleteIfExists(oldFilePath);
                    } catch (Exception ex) {
                        logger.warn("Không thể xóa ảnh cũ: " + oldFilePath, ex);
                    }
                }
                // Lưu file mới
                String fileName = user.getId() + "_AVT.png"; // Đặt tên file cố định cho mỗi user
                // Đường dẫn tuyệt đối tới thư mục uploads/avatars trong project
                String uploadDir = System.getProperty("user.dir") + "/uploads/avatars/";
                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                Path filePath = uploadPath.resolve(fileName);
                avatar.transferTo(filePath.toFile());
                // Đường dẫn trả về cho FE (nên là tương đối để FE truy cập được)
                user.setPictureUrl("/uploads/avatars/" + fileName);
            }

            userDAO.save(user);

            // Trả về profile mới nhất (có thể dùng lại logic getUserProfile)
            Map<String, Object> profile = new HashMap<>();
            profile.put("id", user.getId());
            profile.put("username", user.getUsername());
            profile.put("email", user.getEmail());
            profile.put("firstName", user.getFirstName());
            profile.put("lastName", user.getLastName());
            profile.put("role", user.getRole().name());
            profile.put("pictureUrl", user.getPictureUrl());
            profile.put("phoneNumber", user.getPhoneNumber());
            profile.put("gender", user.getGender());
            profile.put("dateOfBirth", user.getDateOfBirth());
            profile.put("membershipStartDate", user.getMembershipStartDate());
            profile.put("membershipEndDate", user.getMembershipEndDate());

            return ResponseEntity.ok(profile);

        } catch (Exception e) {
            e.printStackTrace(); // In ra log server để debug
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Đã xảy ra lỗi khi cập nhật profile: " + e.getMessage()));
        }
    }

    @GetMapping("/coaches")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllCoaches() {
        try {
            // Track user HTTP activity for online status
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String identifier;
            if (principal instanceof UserDetails) {
                identifier = ((UserDetails) principal).getUsername();
            } else if (principal instanceof User) {
                identifier = ((User) principal).getId();
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Không thể xác định người dùng đã xác thực."));
            }
            
            User currentUser = userDAO.findByEmailOrUsername(identifier)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với định danh: " + identifier));
            
            userStatusService.userHttpActivity(currentUser.getId());

            // Lấy danh sách user có role COACH
            java.util.List<User> coaches = userDAO.findByRole(com.quitsmoking.model.Role.COACH);
            // Chỉ trả về các trường cần thiết cho FE
            java.util.List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
            for (User coach : coaches) {
                java.util.Map<String, Object> coachInfo = new java.util.HashMap<>();
                coachInfo.put("id", coach.getId());
                coachInfo.put("username", coach.getUsername());
                coachInfo.put("email", coach.getEmail());
                coachInfo.put("firstName", coach.getFirstName());
                coachInfo.put("lastName", coach.getLastName());
                coachInfo.put("pictureUrl", coach.getPictureUrl());
                result.add(coachInfo);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Lỗi khi lấy danh sách coach: " + e.getMessage()));
        }
    }
}