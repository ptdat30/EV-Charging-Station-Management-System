package com.quitsmoking.reponsitories;
import com.quitsmoking.model.Achievement;
import com.quitsmoking.model.User;
import com.quitsmoking.model.UserAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievement, String> {
    
    @Query("SELECT ua FROM UserAchievement ua JOIN FETCH ua.achievement WHERE ua.user = :user ORDER BY ua.earnedDate DESC")
    List<UserAchievement> findByUserOrderByEarnedDateDesc(@Param("user") User user);
    
    Optional<UserAchievement> findByUserAndAchievement(User user, Achievement achievement);
    
    boolean existsByUserAndAchievement(User user, Achievement achievement);
    
    @Query("SELECT ua FROM UserAchievement ua JOIN FETCH ua.achievement WHERE ua.isShared = true ORDER BY ua.earnedDate DESC")
    List<UserAchievement> findByIsSharedTrueOrderByEarnedDateDesc();
    
    @Query("SELECT COUNT(ua) FROM UserAchievement ua WHERE ua.user = :user")
    Long countByUser(@Param("user") User user);
    
    @Query("SELECT ua FROM UserAchievement ua JOIN FETCH ua.achievement WHERE ua.user = :user AND ua.isShared = true ORDER BY ua.earnedDate DESC")
    List<UserAchievement> findSharedAchievementsByUser(@Param("user") User user);
}

