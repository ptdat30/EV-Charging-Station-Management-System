// ===============================================================
// FILE: User.java
// PACKAGE: com.driverservice.entities
// MỤC ĐÍCH: Ánh xạ tới bảng 'users' trong cơ sở dữ liệu.
// ===============================================================
package com.notificationservice.entities;

import com.notificationservice.dtos.RegisterRequestDto;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import com.notificationservice.dtos.UserResponseDto;

// [COMMAND]: @Data là annotation của Lombok, tự động tạo ra getters, setters, toString(), equals(), và hashCode().
@Data
// [COMMAND]: @Entity báo cho JPA biết đây là một class cần được ánh xạ tới một bảng trong database.
@Entity
// [COMMAND]: @Table(name = "users") chỉ định rõ class này sẽ ánh xạ tới bảng có tên là "users".
@Table(name = "users")
public class User {

    // [COMMAND]: @Id đánh dấu đây là trường khóa chính.
    @Id
    // [COMMAND]: @GeneratedValue chỉ định cách khóa chính được tạo ra. IDENTITY nghĩa là database sẽ tự động tăng giá trị.
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    // [COMMAND]: @Column ánh xạ trường này tới một cột. unique=true đảm bảo không có 2 email trùng nhau. nullable=false yêu cầu cột này không được rỗng.
    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true)
    private String phone;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name")
    private String fullName;

    // [COMMAND]: @Enumerated(EnumType.STRING) chỉ định rằng khi lưu enum này vào database, hãy lưu dưới dạng chuỗi ("driver", "staff") thay vì số (0, 1).
    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", nullable = false)
    private UserType userType;

    @Enumerated(EnumType.STRING)
    private Status status = Status.active;

    // [COMMAND]: @CreationTimestamp là một annotation của Hibernate. Nó sẽ tự động gán thời gian hiện tại khi một đối tượng được tạo lần đầu.
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // [COMMAND]: @UpdateTimestamp là một annotation của Hibernate. Nó sẽ tự động cập nhật thời gian mỗi khi đối tượng được thay đổi.
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // [COMMAND]: Định nghĩa một enum cho các loại người dùng, khớp với database.
    public enum UserType {
        driver, staff, admin
    }

    // [COMMAND]: Định nghĩa một enum cho các trạng thái, khớp với database.
    public enum Status {
        active, inactive, suspended, deleted
    }

    public interface UserService {
        User registerUser(RegisterRequestDto registerRequestDto);

        // [COMMAND]: Thêm phương thức mới để lấy user theo ID.
        // Nó sẽ trả về UserResponseDto thay vì User entity.
        UserResponseDto getUserById(Long userId);
    }
}