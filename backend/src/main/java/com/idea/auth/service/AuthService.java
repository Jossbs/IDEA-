package com.idea.auth.service;

import com.idea.auth.dto.AuthResponse;
import com.idea.auth.dto.LoginRequest;
import com.idea.auth.dto.RegisterRequest;

/** Public contract for registration, login and token refresh. */
public interface AuthService {

    /** Registers a new user and returns a token pair. */
    AuthResponse register(RegisterRequest request);

    /** Authenticates by email/password and returns a token pair. */
    AuthResponse login(LoginRequest request);

    /** Exchanges a valid refresh token for a new token pair (refresh rotation). */
    AuthResponse refresh(String refreshToken);
}
