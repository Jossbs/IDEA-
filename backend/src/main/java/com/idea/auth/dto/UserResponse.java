package com.idea.auth.dto;

import com.idea.auth.domain.Role;
import java.util.UUID;

/** Public view of a user (never exposes the password hash). */
public record UserResponse(
        UUID userId,
        String email,
        String fullName,
        Role role) {
}
