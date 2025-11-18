// src/main/java/com/quitsmoking/dto/CommunityPostDto.java
package com.quitsmoking.dto;

import com.quitsmoking.model.CommunityPost;
import java.time.LocalDateTime;

public class CommunityPostDto {
    private String id;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private CommunityPost.PostType postType;
    private int likesCount;

    // User details
    private String userId;
    private String username;
    private String firstName;
    private String lastName;
    private String avatarUrl; // Assuming User model has an avatar URL
    private String role; // ADMIN, COACH, MEMBER, GUEST
    private String membershipPlanId; // FREE_TRIAL_PLAN, PLAN30DAYS, PLAN60DAYS, PLAN90DAYS
    private String membershipPlanName; // Tên gói thành viên

    // Constructor (quan trọng để ánh xạ từ Entity sang DTO)
    public CommunityPostDto() {}

    // Constructor để dễ dàng tạo DTO từ CommunityPost và User
    public CommunityPostDto(CommunityPost post, String userId, String username, String firstName, String lastName, String avatarUrl, String role, String membershipPlanId, String membershipPlanName) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.createdAt = post.getCreatedAt();
        this.postType = post.getPostType();
        this.likesCount = post.getLikesCount();
        this.userId = userId;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.avatarUrl = avatarUrl;
        this.role = role;
        this.membershipPlanId = membershipPlanId;
        this.membershipPlanName = membershipPlanName;
    }

    // Getters and Setters cho tất cả các trường
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public CommunityPost.PostType getPostType() { return postType; }
    public void setPostType(CommunityPost.PostType postType) { this.postType = postType; }
    public int getLikesCount() { return likesCount; }
    public void setLikesCount(int likesCount) { this.likesCount = likesCount; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getMembershipPlanId() { return membershipPlanId; }
    public void setMembershipPlanId(String membershipPlanId) { this.membershipPlanId = membershipPlanId; }
    public String getMembershipPlanName() { return membershipPlanName; }
    public void setMembershipPlanName(String membershipPlanName) { this.membershipPlanName = membershipPlanName; }
}