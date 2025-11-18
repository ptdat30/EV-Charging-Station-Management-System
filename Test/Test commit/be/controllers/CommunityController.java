package com.quitsmoking.controllers;
import com.quitsmoking.model.CommunityPost;
import com.quitsmoking.model.User;
import com.quitsmoking.services.CommunityService;
import com.quitsmoking.services.UserService;
import com.quitsmoking.dto.CommunityPostDto; // Import CommunityPostDto
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.Collections; // Import Collections
import org.slf4j.Logger; // Import Logger
import org.slf4j.LoggerFactory; // Import LoggerFactory

@RestController
@RequestMapping("/api/community")
@CrossOrigin(origins = "http://localhost:3000")
public class CommunityController {

    private static final Logger logger = LoggerFactory.getLogger(CommunityController.class); // Initialize logger

    @Autowired
    private CommunityService communityService;
    @Autowired
    private UserService userService;


    @PostMapping("/posts")
    public ResponseEntity<?> createPost(
            @RequestBody CreatePostRequest request,
            Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());

            // Track user HTTP activity for online status
            // Sửa lỗi: Bình luận dòng này vì phương thức logUserActivity không tìm thấy
            // Bạn cần đảm bảo phương thức này tồn tại trong UserStatusService
            // userStatusService.logUserActivity(user.getId());

            if (user == null) {
                return ResponseEntity.status(404).body("User not found.");
            }

            CommunityPostDto postDto = new CommunityPostDto();
            postDto.setTitle(request.getTitle());
            postDto.setContent(request.getContent());
            postDto.setPostType(request.getPostType());

            if (communityService.createPost(postDto, user)) {
                return ResponseEntity.ok(Collections.singletonMap("message", "Post created successfully."));
            } else {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Error creating post. Invalid post type or other issue."));
            }
        } catch (Exception e) {
            logger.error("Error creating post: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Lỗi: " + e.getMessage()));
        }
    }

    @GetMapping("/posts")
    public ResponseEntity<?> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Received request to get all posts, page: {}, size: {}", page, size);
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<CommunityPostDto> postsPage = communityService.getAllPosts(pageable);

            logger.info("Retrieved {} posts for page {} of all posts.", postsPage.getNumberOfElements(), page);
            return ResponseEntity.ok(postsPage);
        } catch (Exception e) {
            logger.error("Error retrieving posts: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Lỗi: " + e.getMessage()));
        }
    }

    @DeleteMapping("/posts/{postId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePost(@PathVariable String postId) {
        try {
            communityService.deletePost(postId);
            return ResponseEntity.ok(Collections.singletonMap("message", "Xóa bài viết thành công!"));
        } catch (Exception e) {
            logger.error("Error deleting post: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Lỗi: " + e.getMessage()));
        }
    }

    // DTO classes
    public static class CreatePostRequest {
        private String title;
        private String content;
        private CommunityPost.PostType postType;
        private String achievementId;
        // Constructors
        public CreatePostRequest() {}
        // Getters and Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public CommunityPost.PostType getPostType() { return postType; }
        public void setPostType(CommunityPost.PostType postType) { this.postType = postType; }
        public String getAchievementId() { return achievementId; }
        public void setAchievementId(String achievementId) { this.achievementId = achievementId; }
    }
    public static class UpdatePostRequest {
        private String title;
        private String content;
        // Constructors
        public UpdatePostRequest() {}
        // Getters and Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}