package com.idea.auth.dto;

/**
 * Successful authentication result: the token pair plus the authenticated user.
 * {@code tokenType} is always {@code "Bearer"} for use in the Authorization header.
 */
public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        UserResponse user) {

    public static AuthResponse of(String accessToken, String refreshToken, UserResponse user) {
        return new AuthResponse(accessToken, refreshToken, "Bearer", user);
    }
}
