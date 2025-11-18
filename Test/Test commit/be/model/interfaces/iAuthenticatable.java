package com.quitsmoking.model.interfaces;

import com.quitsmoking.model.Role;

public interface iAuthenticatable {
    /**
     * Phương thức này biểu thị hành động đăng nhập thành công của một thực thể.
     * Nó có thể được sử dụng để ghi log, thay đổi trạng thái nội bộ,
     * hoặc thông báo cho hệ thống rằng thực thể này đã được xác thực.
     */
    void login(); 
    String getUsername();
    Role getRole();
    String getId();
}
