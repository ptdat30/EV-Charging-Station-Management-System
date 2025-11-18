package com.quitsmoking.controllers;

import com.quitsmoking.dto.CommentDTO;
import com.quitsmoking.services.CommunityCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/community/comments")
@Validated
public class CommunityCommentController {

    private final CommunityCommentService commentService;

    @Autowired
    public CommunityCommentController(CommunityCommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<CommentDTO> createComment(
            @Valid @RequestBody CommentDTO commentDTO,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String currentUserId = authentication.getName();
        CommentDTO createdComment = commentService.createComment(commentDTO, currentUserId);
        return ResponseEntity.ok(createdComment);
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByPostId(
            @PathVariable String postId,
            Authentication authentication) {
        String currentUserId = authentication != null ? authentication.getName() : null;
        List<CommentDTO> comments = commentService.getCommentsByPostId(postId, currentUserId);
        return ResponseEntity.ok(comments);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String commentId,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String currentUserId = authentication.getName();
        commentService.deleteComment(commentId, currentUserId);
        return ResponseEntity.noContent().build();
    }
}