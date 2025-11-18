package com.quitsmoking.dto.response;

import java.time.Instant; // Giữ Instant để lưu trữ thời gian độc lập múi giờ

public class FeedbackResponse {
    private Long id;
    private Integer rating;
    private String feedbackContent;
    private Instant submissionTime;
    private String userId; // ID của người dùng đã gửi feedback, vẫn là String (UUID)
    private String userName; // Tên đầy đủ của người dùng (firstName + lastName)
    private String userEmail; // Email của người dùng
    private String message; // Thông báo thành công

    // Constructor để khởi tạo đối tượng FeedbackResponse
    public FeedbackResponse(Long id, Integer rating, String feedbackContent,
                            Instant submissionTime, String userId, String message) {
        this.id = id;
        this.rating = rating;
        this.feedbackContent = feedbackContent;
        this.submissionTime = submissionTime;
        this.userId = userId;
        this.message = message;
    }

    // Constructor mới với thông tin user
    public FeedbackResponse(Long id, Integer rating, String feedbackContent,
                            Instant submissionTime, String userId, String userName, String userEmail, String message) {
        this.id = id;
        this.rating = rating;
        this.feedbackContent = feedbackContent;
        this.submissionTime = submissionTime;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.message = message;
    }

    // --- Getters ---
    public Long getId() {
        return id;
    }

    public Integer getRating() {
        return rating;
    }

    public String getFeedbackContent() {
        return feedbackContent;
    }

    public Instant getSubmissionTime() {
        return submissionTime;
    }

    public String getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getMessage() {
        return message;
    }

    // --- Setters ---
    public void setId(Long id) {
        this.id = id;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public void setFeedbackContent(String feedbackContent) {
        this.feedbackContent = feedbackContent;
    }

    public void setSubmissionTime(Instant submissionTime) {
        this.submissionTime = submissionTime;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}