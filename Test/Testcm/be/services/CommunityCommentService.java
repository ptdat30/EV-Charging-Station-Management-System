package com.quitsmoking.services;

import com.quitsmoking.dto.CommentDTO;
import com.quitsmoking.exceptions.NotFoundException;
import com.quitsmoking.exceptions.UnauthorizedException;
import com.quitsmoking.model.CommunityComment;
import com.quitsmoking.model.CommunityPost;
import com.quitsmoking.model.User;
import com.quitsmoking.reponsitories.CommunityCommentRepository;
import com.quitsmoking.reponsitories.CommunityPostRepository;
import com.quitsmoking.reponsitories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommunityCommentService {

    private final CommunityCommentRepository commentRepository;
    private final CommunityPostRepository postRepository;
    private final UserRepository userRepository;

    @Autowired
    public CommunityCommentService(CommunityCommentRepository commentRepository,
                                   CommunityPostRepository postRepository,
                                   UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CommentDTO createComment(CommentDTO commentDTO, String currentUsername) {
        CommunityPost post = postRepository.findById(commentDTO.getPostId())
                .orElseThrow(() -> new NotFoundException("Post not found with id: " + commentDTO.getPostId()));

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new NotFoundException("User not found with username: " + currentUsername));

        CommunityComment comment = new CommunityComment();
        comment.setPost(post);
        comment.setUser(user);
        comment.setContent(commentDTO.getContent());

        if (commentDTO.getParentCommentId() != null) {
            CommunityComment parentComment = commentRepository.findById(commentDTO.getParentCommentId())
                    .orElseThrow(() -> new NotFoundException("Parent comment not found with id: " + commentDTO.getParentCommentId()));
            comment.setParentComment(parentComment);
        }

        CommunityComment savedComment = commentRepository.save(comment);
        return convertToDTO(savedComment, user.getId());
    }

    public List<CommentDTO> getCommentsByPostId(String postId, String currentUserId) {
        List<CommunityComment> topLevelComments = commentRepository.findTopLevelCommentsByPostId(postId);
        return topLevelComments.stream()
                .map(comment -> {
                    CommentDTO dto = convertToDTO(comment, currentUserId);
                    List<CommunityComment> replies = commentRepository.findRepliesByParentCommentId(comment.getId());
                    dto.setReplies(replies.stream()
                            .map(reply -> convertToDTO(reply, currentUserId))
                            .collect(Collectors.toList()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(String commentId, String currentUserId) {
        CommunityComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Comment not found with id: " + commentId));

        if (!comment.getUser().getId().equals(currentUserId)) {
            throw new UnauthorizedException("You are not authorized to delete this comment");
        }

        if (!commentRepository.findRepliesByParentCommentId(commentId).isEmpty()) {
            commentRepository.deleteByParentCommentId(commentId);
        }

        commentRepository.delete(comment);
    }

    private CommentDTO convertToDTO(CommunityComment comment, String currentUserId) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setPostId(comment.getPost().getId());
        dto.setUserId(comment.getUser().getId());
        dto.setUsername(comment.getUser().getUsername());
        dto.setFirstName(comment.getUser().getFirstName());
        dto.setLastName(comment.getUser().getLastName());
        dto.setAvatarUrl(comment.getUser().getPictureUrl());
        dto.setContent(comment.getContent());
        dto.setParentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null);
        dto.setLikesCount(comment.getLikesCount());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setOwner(comment.getUser().getId().equals(currentUserId));
        return dto;
    }
}