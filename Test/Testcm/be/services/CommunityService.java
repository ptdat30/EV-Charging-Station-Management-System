package com.quitsmoking.services;

import com.quitsmoking.dto.CommunityPostDto;
import com.quitsmoking.model.CommunityComment;
import com.quitsmoking.model.CommunityPost;
import com.quitsmoking.model.User;
import com.quitsmoking.reponsitories.CommunityCommentRepository;
import com.quitsmoking.reponsitories.CommunityPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Import Transactional

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CommunityService {
    @Autowired
    private CommunityPostRepository communityPostRepository;
    @Autowired
    private CommunityCommentRepository communityCommentRepository;

    public boolean createPost(CommunityPostDto postDto, User user) {
        CommunityPost.PostType postType = postDto.getPostType();
        try {
            CommunityPost post = new CommunityPost();
            post.setTitle(postDto.getTitle());
            post.setContent(postDto.getContent());
            post.setCreatedAt(LocalDateTime.now());
            post.setPostType(postType);
            post.setUser(user);
            communityPostRepository.save(post);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    // Đảm bảo rằng phương thức này chạy trong một giao dịch
    @Transactional(readOnly = true)
    public List<CommunityPostDto> getAllPostsAndUserDetails() {
        List<CommunityPost> posts = communityPostRepository.findAll();

        return posts.stream().map(post -> {
            User user = post.getUser();
            String userId = (user != null) ? user.getId() : null;
            String username = (user != null) ? user.getUsername() : null;
            String firstName = (user != null) ? user.getFirstName() : null;
            String lastName = (user != null) ? user.getLastName() : null;
            String avatarUrl = (user != null) ? user.getPictureUrl() : null;
            String role = (user != null && user.getRole() != null) ? user.getRole().name() : null;
            String membershipPlanId = (user != null && user.getCurrentMembershipPlan() != null) ? user.getCurrentMembershipPlan().getId() : null;
            String membershipPlanName = (user != null && user.getCurrentMembershipPlan() != null) ? user.getCurrentMembershipPlan().getPlanName() : null;

            return new CommunityPostDto(
                    post,
                    userId,
                    username,
                    firstName,
                    lastName,
                    avatarUrl,
                    role,
                    membershipPlanId,
                    membershipPlanName
            );
        }).collect(Collectors.toList());
    }

    // Đảm bảo rằng phương thức này chạy trong một giao dịch
    @Transactional(readOnly = true)
    public Page<CommunityPostDto> getAllPosts(Pageable pageable) {
        Page<CommunityPost> postsPage = communityPostRepository.findAll(pageable);
        return postsPage.map(post -> {
            User user = post.getUser();
            String userId = (user != null) ? user.getId() : null;
            String username = (user != null) ? user.getUsername() : null;
            String firstName = (user != null) ? user.getFirstName() : null;
            String lastName = (user != null) ? user.getLastName() : null;
            String avatarUrl = (user != null) ? user.getPictureUrl() : null;
            String role = (user != null && user.getRole() != null) ? user.getRole().name() : null;
            String membershipPlanId = (user != null && user.getCurrentMembershipPlan() != null) ? user.getCurrentMembershipPlan().getId() : null;
            String membershipPlanName = (user != null && user.getCurrentMembershipPlan() != null) ? user.getCurrentMembershipPlan().getPlanName() : null;

            return new CommunityPostDto(
                    post,
                    userId,
                    username,
                    firstName,
                    lastName,
                    avatarUrl,
                    role,
                    membershipPlanId,
                    membershipPlanName
            );
        });
    }

    public CommunityPost likePost(String postId) {
        Optional<CommunityPost> postOpt = communityPostRepository.findById(postId);
        if (postOpt.isPresent()) {
            CommunityPost post = postOpt.get();
            post.setLikesCount(post.getLikesCount() + 1);
            return communityPostRepository.save(post);
        }
        throw new RuntimeException("Post not found");
    }

    public CommunityPost updatePost(String postId, String title, String content) {
        Optional<CommunityPost> postOpt = communityPostRepository.findById(postId);
        if (postOpt.isPresent()) {
            CommunityPost post = postOpt.get();
            post.setTitle(title);
            post.setContent(content);
            return communityPostRepository.save(post);
        }
        throw new RuntimeException("Post not found");
    }

    @Transactional
    public void deletePost(String postId) {
        // Xóa toàn bộ comment liên quan trước
        communityCommentRepository.deleteByPostId(postId);
        communityPostRepository.deleteById(postId);
    }

    public CommunityPost setFeatured(String postId, boolean featured) {
        Optional<CommunityPost> postOpt = communityPostRepository.findById(postId);
        if (postOpt.isPresent()) {
            CommunityPost post = postOpt.get();
            post.setFeatured(featured);
            return communityPostRepository.save(post);
        }
        throw new RuntimeException("Post not found");
    }

    public List<CommunityComment> getAllComments(){
        return communityCommentRepository.findAll();
    }
}