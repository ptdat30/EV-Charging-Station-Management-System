// FILE: UserServiceClient.java (in auth-service)
package com.authservice.clients;

import com.authservice.dtos.internal.UserDetailDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

// Định nghĩa client gọi đến USER-SERVICE
@FeignClient(name = "USER-SERVICE")
public interface UserServiceClient {

    // Giả sử user-service có endpoint /api/users/by-email?email=...
    // Chúng ta sẽ cần tạo endpoint này bên user-service sau
    @GetMapping("/api/users/by-email")
    UserDetailDto getUserByEmail(@RequestParam("email") String email);
}