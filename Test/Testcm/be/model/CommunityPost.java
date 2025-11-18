package com.quitsmoking.model;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;
@Entity
@Table(name = "community_posts")
@Getter
@Setter
@NoArgsConstructor
public class CommunityPost {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "VARCHAR(36)")
    private String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(nullable = false, length = 200)
    private String title;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    @Enumerated(EnumType.STRING)
    @Column(name = "post_type", nullable = false)
    private PostType postType;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "achievement_id")
    private Achievement achievement; // Nếu là chia sẻ thành tích
    @Column(name = "likes_count")
    private int likesCount = 0;
    @Column(name = "comments_count")
    private int commentsCount = 0;
    @Column(name = "is_featured")
    private boolean isFeatured = false;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    public CommunityPost(User user, String title, String content, PostType postType) {
        this.user = user;
        this.title = title;
        this.content = content;
        this.postType = postType;
    }
    public enum PostType {
        ACHIEVEMENT_SHARE,
        MOTIVATION,
        QUESTION,
        ADVICE
    }
}
