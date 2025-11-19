package com.quitsmoking.services;
import com.quitsmoking.dto.request.FeedbackRequest;
import com.quitsmoking.dto.response.FeedbackResponse;
import com.quitsmoking.model.Feedback;
import com.quitsmoking.model.User; // Bỏ comment nếu bạn muốn liên kết với User
import com.quitsmoking.reponsitories.FeedbackRepository;
import com.quitsmoking.reponsitories.UserDAO; // Bỏ comment nếu bạn muốn liên kết với User
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication; // Bỏ comment nếu dùng Spring Security
import org.springframework.security.core.context.SecurityContextHolder; // Bỏ comment nếu dùng Spring Security
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service

public class FeedbackService {
        private static final Logger logger = LoggerFactory.getLogger(FeedbackService.class);

    private final FeedbackRepository feedbackRepository;
    private final UserDAO userDAO;

    @Autowired
    public FeedbackService(FeedbackRepository feedbackRepository, UserDAO userDAO) {
        this.feedbackRepository = feedbackRepository;
        this.userDAO = userDAO;
    }

    @Transactional
    public FeedbackResponse submitFeedback(FeedbackRequest feedbackRequest) {
        logger.info("Submitting feedback with rating: {} and content: {}",
                feedbackRequest.getRating(), feedbackRequest.getFeedbackContent());

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = null;

        if (authentication != null && authentication.isAuthenticated() && !("anonymousUser").equals(authentication.getPrincipal())) {
            String username = authentication.getName();
            currentUser = userDAO.findByUsername(username)
                                 .orElseThrow(() -> {
                                     logger.error("Authenticated user not found in database: {}", username);
                                     return new RuntimeException("Authenticated user not found.");
                                 });
        } else {
            logger.warn("Feedback submitted by an unauthenticated or anonymous user, or principal type is unexpected.");
            throw new RuntimeException("User must be authenticated to submit feedback.");
        }

        // --- Logic ĐẶC BIỆT cho mối quan hệ One-to-One ---
        // Kiểm tra xem người dùng đã có feedback chưa
        Optional<Feedback> existingFeedback = feedbackRepository.findByUser(currentUser); // Cần thêm phương thức này vào FeedbackRepository

        Feedback feedback;
        if (existingFeedback.isPresent()) {
            // Nếu người dùng đã có feedback, cập nhật feedback hiện có
            feedback = existingFeedback.get();
            feedback.setRating(feedbackRequest.getRating());
            feedback.setFeedbackContent(feedbackRequest.getFeedbackContent());
            logger.info("Updating existing feedback for user: {}", currentUser.getUsername());
        } else {
            // Nếu chưa có, tạo feedback mới
            feedback = new Feedback();
            feedback.setRating(feedbackRequest.getRating());
            feedback.setFeedbackContent(feedbackRequest.getFeedbackContent());
            feedback.setUser(currentUser); // Gán người dùng vào feedback
            logger.info("Creating new feedback for user: {}", currentUser.getUsername());
        }
        // submissionTime sẽ tự động được gán/cập nhật bằng @PrePersist (khi tạo mới)
        // hoặc giữ nguyên nếu bạn không muốn cập nhật nó khi sửa đổi.
        // Nếu muốn cập nhật submissionTime khi sửa, bạn có thể dùng @PreUpdate
        // hoặc gán trực tiếp: feedback.setSubmissionTime(Instant.now());

        Feedback savedFeedback = feedbackRepository.save(feedback); // .save() sẽ tự động update nếu entity đã có ID
        logger.info("Feedback saved successfully with ID: {} by user: {}", savedFeedback.getId(), currentUser.getUsername());

        // Trong FeedbackService.java, khoảng dòng 78
        // Lấy các giá trị cần thiết từ savedFeedback để truyền vào constructor
        Long feedbackId = savedFeedback.getId();
        Integer rating = savedFeedback.getRating();
        String feedbackContent = savedFeedback.getFeedbackContent(); // Đảm bảo tên phương thức getter này khớp với entity Feedback của bạn
        java.time.Instant submissionTime = savedFeedback.getSubmissionTime(); // Đảm bảo kiểu dữ liệu khớp
        String userId = (savedFeedback.getUser() != null) ? savedFeedback.getUser().getId() : null;
        
        // Lấy thông tin user name và email
        String userName = "N/A";
        String userEmail = "N/A";
        if (savedFeedback.getUser() != null) {
            User user = savedFeedback.getUser();
            String firstName = user.getFirstName() != null ? user.getFirstName() : "";
            String lastName = user.getLastName() != null ? user.getLastName() : "";
            userName = (firstName + " " + lastName).trim();
            if (userName.isEmpty()) {
                userName = user.getUsername(); // Fallback to username if no name
            }
            userEmail = user.getEmail() != null ? user.getEmail() : "N/A";
        }
        
        String message = existingFeedback.isPresent() ? "Phản hồi của bạn đã được cập nhật. Xin cảm ơn!" : "Phản hồi của bạn đã được ghi nhận. Xin cảm ơn!"; // Thông báo mong muốn

        // Tạo đối tượng FeedbackResponse bằng constructor
        return new FeedbackResponse(
                feedbackId,
                rating,
                feedbackContent,
                submissionTime,
                userId,
                userName,
                userEmail,
                message
        );
    }

    /**
     * Lấy feedback hiện tại của người dùng đã đăng nhập.
     * @return FeedbackResponse chứa thông tin feedback của người dùng
     * @throws RuntimeException nếu người dùng chưa có feedback
     */
    public FeedbackResponse getMyFeedback() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = null;

        if (authentication != null && authentication.isAuthenticated() && !("anonymousUser").equals(authentication.getPrincipal())) {
            String username = authentication.getName();
            currentUser = userDAO.findByUsername(username)
                                 .orElseThrow(() -> {
                                     logger.error("Authenticated user not found in database: {}", username);
                                     return new RuntimeException("Authenticated user not found.");
                                 });
        } else {
            logger.warn("Attempting to get feedback by an unauthenticated or anonymous user.");
            throw new RuntimeException("User must be authenticated to get feedback.");
        }

        Optional<Feedback> existingFeedback = feedbackRepository.findByUser(currentUser);
        
        if (existingFeedback.isPresent()) {
            Feedback feedback = existingFeedback.get();
            
            // Lấy thông tin user name và email
            String userName = "N/A";
            String userEmail = "N/A";
            if (feedback.getUser() != null) {
                User user = feedback.getUser();
                String firstName = user.getFirstName() != null ? user.getFirstName() : "";
                String lastName = user.getLastName() != null ? user.getLastName() : "";
                userName = (firstName + " " + lastName).trim();
                if (userName.isEmpty()) {
                    userName = user.getUsername(); // Fallback to username if no name
                }
                userEmail = user.getEmail() != null ? user.getEmail() : "N/A";
            }
            
            return new FeedbackResponse(
                feedback.getId(),
                feedback.getRating(),
                feedback.getFeedbackContent(),
                feedback.getSubmissionTime(),
                feedback.getUser().getId(),
                userName,
                userEmail,
                "Feedback hiện tại của bạn"
            );
        } else {
            throw new RuntimeException("User has no feedback yet.");
        }
    }
}
