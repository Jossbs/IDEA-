package com.idea.auth.mapper;

import com.idea.auth.domain.User;
import com.idea.auth.dto.UserResponse;

/** Maps {@link User} entities to their public DTO. */
public final class AuthMapper {

    private AuthMapper() {
    }

    public static UserResponse toUserResponse(User user) {
        return new UserResponse(user.getUserId(), user.getEmail(), user.getFullName(), user.getRole());
    }
}
