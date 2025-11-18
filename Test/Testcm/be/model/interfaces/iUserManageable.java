//Phương thức này sẽ được Admin sử dụng để quản lý toàn bộ người dùng trong hệ thống.
package com.quitsmoking.model.interfaces;

import com.quitsmoking.model.Role;
import com.quitsmoking.model.User;

public interface iUserManageable {
    // Phương thức để xem chi tiết thông tin của bất kỳ người dùng nào
    void viewUserDetails(String userId);

    // Phương thức để cập nhật thông tin của một người dùng khác
    // User updatedUser có thể là một DTO hoặc trực tiếp User để dễ truyền dữ liệu
    void updateUserDetails(String userId, User updatedUser);

    // Phương thức để xóa người dùng
    void deleteUser(String userId);

    // Phương thức để reset mật khẩu của người dùng khác
    void resetUserPassword(String userId);

    // Phương thức để BAN (cấm) người dùng
    void banUser(String userId);

    // Phương thức để tạo tài khoản người dùng mới
    User createUserAccount(String username, String rawPassword, String email, String firstName, String lastName, Role role);

    // Phương thức để thay đổi vai trò của người dùng
    boolean changeUserRole(String userId, Role newRole);
}