// ===============================================================
// FILE: UserRepository.java
// PACKAGE: com.driverservice.repositories
// MỤC ĐÍCH: Cung cấp các phương thức để thao tác với bảng 'users'.
// ===============================================================
package com.stationservice.repositories;

import com.stationservice.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// [COMMAND]: @Repository đánh dấu đây là một Spring component thuộc tầng Repository.
@Repository
// [COMMAND]: extends JpaRepository<User, Long>
// - User: Đây là Entity mà Repository này sẽ quản lý.
// - Long: Đây là kiểu dữ liệu của khóa chính (user_id) trong Entity User.
public interface UserRepository extends JpaRepository<User, Long> {

    // [COMMAND]: Spring Data JPA sẽ tự động hiểu tên phương thức này và tạo ra một câu query
    // để tìm một User dựa trên trường 'email'.
    // Optional<User> giúp xử lý trường hợp không tìm thấy user một cách an toàn (tránh NullPointerException).
    Optional<User> findByEmail(String email);

}