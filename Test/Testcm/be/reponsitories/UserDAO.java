package com.quitsmoking.reponsitories;

// import com.quitsmoking.model.AuthProvider;
import com.quitsmoking.model.User;
import com.quitsmoking.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
// import java.util.UUID;

@Repository
public interface UserDAO extends JpaRepository<User, String> {

    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    List<User> findByRole(Role role);

    // Sửa phương thức tìm kiếm bằng email hoặc username
    @Query("SELECT u FROM User u WHERE u.email = :identifier OR u.username = :identifier")
    Optional<User> findByEmailOrUsername(String identifier);

    // Phương thức cập nhật vai trò
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.role = :newRole WHERE u.id = :userId")
    void updateUserRole(String userId, String newRole);

    // Phương thức tìm kiếm người dùng theo ID và tải MembershipPlan hiện tại
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.currentMembershipPlan WHERE u.id = :id")
    Optional<User> findByIdWithMembership(@Param("id") String id);

    // Phương thức mới để tìm User theo email HOẶC username VÀ JOIN FETCH membership
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.currentMembershipPlan WHERE u.email = :identifier OR u.username = :identifier")
    Optional<User> findByEmailOrUsernameWithMembership(@Param("identifier") String identifier);

    // Phương thức tìm kiếm người dùng theo Google ID và tải MembershipPlan hiện tại
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.currentMembershipPlan WHERE u.googleId = :googleId")
    Optional<User> findByGoogleIdWithMembership(@Param("googleId") String googleId);
    
    // Phương thức tìm kiếm người dùng theo email và tải MembershipPlan hiện tại
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.currentMembershipPlan WHERE u.email = :email")
    Optional<User> findByEmailWithMembership(@Param("email") String email);

    // Lấy toàn bộ user kèm MembershipPlan (fetch join)
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.currentMembershipPlan")
    List<User> findAllWithMembership();
}