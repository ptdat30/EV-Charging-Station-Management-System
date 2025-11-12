// FILE: UserServiceClient.java (in notification-service)
package com.notificationservice.clients;

import com.notificationservice.dtos.internal.UserEmailDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

// Client to call USER-SERVICE
@FeignClient(name = "USER-SERVICE")
public interface UserServiceClient {

    /**
     * Get user by ID
     * Match the GET /api/users/{id} endpoint in user-service
     */
    @GetMapping("/api/users/{id}")
    UserEmailDto getUserById(@PathVariable("id") Long userId);

    /**
     * Get all users (for admin notifications)
     * Match the GET /api/users/getall endpoint in user-service
     */
    @GetMapping("/api/users/getall")
    List<UserEmailDto> getAllUsers();
}