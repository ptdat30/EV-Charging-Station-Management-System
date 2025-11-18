package com.quitsmoking.model;

import jakarta.persistence.*;
import java.time.Instant; // Dùng Instant cho timestamp

@Entity
@Table(name = "feedbacks", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id"}, name = "unique_user_feedback")
}) // Tên bảng trong cơ sở dữ liệu với unique constraint
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID tự tăng cho bảng feedbacks
    private Long id; // Sử dụng Long cho ID tự tăng

    // Mối quan hệ Many-to-One với User
    // Một người dùng có thể gửi nhiều phản hồi, mỗi phản hồi thuộc về một người dùng
    @ManyToOne(fetch = FetchType.LAZY) // Tải User một cách lười biếng (lazy) để cải thiện hiệu suất
    @JoinColumn(name = "user_id", nullable = false) // Tên cột khóa ngoại trong bảng 'feedbacks'
    private User user; // Liên kết với User entity

    @Column(name = "rating", nullable = false)
    private Integer rating; // Đánh giá số sao (ví dụ: 1-5)

    @Lob // Đánh dấu là trường dữ liệu lớn (Large Object)
    @Column(name = "noi_dung_feedback", columnDefinition = "TEXT", nullable = true) // Tên cột và kiểu TEXT cho nội dung dài
    private String feedbackContent; // Nội dung phản hồi

    @Column(name = "thoi_gian_gui", nullable = false)
    private Instant submissionTime; // Thời gian phản hồi được gửi

    // Constructor mặc định (cần thiết cho JPA)
    public Feedback() {
        // ID sẽ được tạo tự động bởi GenerationType.IDENTITY, không cần gán UUID ở đây
    }

    // Constructor với các tham số chính
    // Sử dụng constructor này khi bạn tạo một feedback mới từ logic nghiệp vụ
    public Feedback(User user, Integer rating, String feedbackContent) {
        this(); // Gọi constructor mặc định để khởi tạo các giá trị mặc định nếu có (ví dụ: submissionTime)
        this.user = user;
        this.rating = rating;
        this.feedbackContent = feedbackContent;
        // submissionTime sẽ được @PrePersist xử lý
    }

    // --- Getters và Setters ---
    // Các phương thức getter và setter thủ công, tương tự như cách bạn đã làm trong QuitPlan
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getFeedbackContent() {
        return feedbackContent;
    }

    public void setFeedbackContent(String feedbackContent) {
        this.feedbackContent = feedbackContent;
    }

    public Instant getSubmissionTime() {
        return submissionTime;
    }

    public void setSubmissionTime(Instant submissionTime) {
        this.submissionTime = submissionTime;
    }

    // --- Callback phương thức trước khi lưu ---
    // Phương thức này sẽ được tự động gọi trước khi đối tượng Feedback được lưu vào cơ sở dữ liệu
    @PrePersist
    protected void onCreate() {
        submissionTime = Instant.now(); // Gán thời gian hiện tại khi Feedback được tạo lần đầu
    }
}