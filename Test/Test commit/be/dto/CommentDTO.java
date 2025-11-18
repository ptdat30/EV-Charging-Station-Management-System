package com.quitsmoking.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CommentDTO {
    private String id;

    @NotBlank(message = "Post ID is required")
    private String postId;

    private String userId;
    private String username;
    private String firstName;
    private String lastName;
    private String avatarUrl;

    @NotBlank(message = "Content is required")
    private String content;

    private String parentCommentId;

    @NotNull
    private Integer likesCount = 0;

    private LocalDateTime createdAt;
    private boolean owner; // Đổi từ isOwner -> owner để phù hợp với Java Bean convention
    private List<CommentDTO> replies;

    // Thêm thủ công getter và setter cho owner
    public boolean isOwner() {
        return owner;
    }

    public void setOwner(boolean owner) {
        this.owner = owner;
    }
}