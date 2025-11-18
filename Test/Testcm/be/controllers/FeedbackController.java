package com.quitsmoking.controllers;

import com.quitsmoking.dto.request.FeedbackRequest;
import com.quitsmoking.dto.response.FeedbackResponse;
import com.quitsmoking.services.FeedbackService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedback")
// Cấu hình CORS cho Controller này. Tốt hơn nên cấu hình toàn cục trong WebConfig.java
// @CrossOrigin(origins = "http://localhost:5173") // Thay bằng domain frontend của bạn

public class FeedbackController {
    private static final Logger logger = LoggerFactory.getLogger(FeedbackController.class);

    private final FeedbackService feedbackService;

    @Autowired
    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    /**
     * Endpoint để lấy feedback hiện tại của người dùng đã đăng nhập.
     * @return ResponseEntity với FeedbackResponse nếu có, hoặc 404 nếu chưa có feedback.
     */
    @GetMapping("/my-feedback")
    public ResponseEntity<FeedbackResponse> getMyFeedback() {
        logger.debug("Received GET request to /api/feedback/my-feedback");
        try {
            FeedbackResponse response = feedbackService.getMyFeedback();
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.warn("User has no feedback yet: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint để người dùng gửi phản hồi/đánh giá.
     * @param feedbackRequest DTO chứa rating và nội dung phản hồi.
     * @return ResponseEntity với FeedbackResponse và HttpStatus.CREATED nếu thành công.
     */
    @PostMapping
    public ResponseEntity<FeedbackResponse> submitFeedback(@Valid @RequestBody FeedbackRequest feedbackRequest) {
        logger.debug("Received POST request to /api/feedback with data: {}", feedbackRequest);
        FeedbackResponse response = feedbackService.submitFeedback(feedbackRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
