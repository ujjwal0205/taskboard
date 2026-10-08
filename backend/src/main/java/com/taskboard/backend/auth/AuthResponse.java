package com.taskboard.backend.auth;

import com.taskboard.backend.user.UserResponse;

public record AuthResponse(
    String token ,
    UserResponse user
) {
    
}
