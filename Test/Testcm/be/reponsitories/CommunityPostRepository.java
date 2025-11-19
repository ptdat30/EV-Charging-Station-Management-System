package com.quitsmoking.reponsitories;

import com.quitsmoking.model.CommunityPost;
import com.quitsmoking.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPost, String> {

    Page<CommunityPost> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<CommunityPost> findByPostTypeOrderByCreatedAtDesc(CommunityPost.PostType postType, Pageable pageable);

    List<CommunityPost> findByUserOrderByCreatedAtDesc(User user);

    List<CommunityPost> findByIsFeaturedTrueOrderByCreatedAtDesc();

    @Query("SELECT cp FROM CommunityPost cp WHERE cp.title LIKE %:keyword% OR cp.content LIKE %:keyword% ORDER BY cp.createdAt DESC")
    Page<CommunityPost> searchPosts(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT cp FROM CommunityPost cp ORDER BY cp.likesCount DESC, cp.createdAt DESC")
    Page<CommunityPost> findMostPopularPosts(Pageable pageable);

    @Query(value = "SELECT cp.id, cp.commentsCount, cp.content, cp.createdAt, cp.likesCount, cp.postType, cp.title, u.pictureUrl, u.username from CommunityPost cp join User u on cp.user.id=u.id order by cp.createdAt asc")
    List<Object> findAllPostsAndUserDetails();
}