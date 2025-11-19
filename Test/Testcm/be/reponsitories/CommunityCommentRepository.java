package com.quitsmoking.reponsitories;

import com.quitsmoking.model.CommunityComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityCommentRepository extends JpaRepository<CommunityComment, String> {

    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT c FROM CommunityComment c WHERE c.post.id = :postId AND c.parentComment IS NULL ORDER BY c.createdAt ASC")
    List<CommunityComment> findTopLevelCommentsByPostId(@Param("postId") String postId);

    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT c FROM CommunityComment c WHERE c.parentComment.id = :parentId ORDER BY c.createdAt ASC")
    List<CommunityComment> findRepliesByParentCommentId(@Param("parentId") String parentId);

    long countByPostId(String postId);

    void deleteByPostId(String postId);

    @Modifying
    @Query("DELETE FROM CommunityComment c WHERE c.parentComment.id = :parentId")
    void deleteByParentCommentId(@Param("parentId") String parentId);
}