// FILE: UserServiceClient.java (in notification-service)
package com.notificationservice.clients;

import com.notificationservice.dtos.internal.UserEmailDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// Client to call USER-SERVICE
@FeignClient(name = "USER-SERVICE")
public interface UserServiceClient {

    // Match the GET /api/users/{id} endpoint in user-service,
    // assuming it returns a DTO containing at least userId and email.
    // We might need to adjust the return type if UserResponseDto doesn't fit exactly.
    // Let's assume user-service returns UserResponseDto which includes email.
    // We'll map it to UserEmailDto locally.
    // Ideally, user-service would have a dedicated endpoint returning just the email.
    @GetMapping("/api/users/{id}")
    UserEmailDto getUserById(@PathVariable("id") Long userId);

    // Alternative (Better if implemented in user-service):
    // @GetMapping("/api/users/{id}/email") // Hypothetical endpoint
    // String getUserEmailById(@PathVariable("id") Long userId);
}