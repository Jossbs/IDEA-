package com.idea.auth.service;

import com.idea.auth.dto.AuthResponse;
import com.idea.auth.dto.LoginRequest;
import com.idea.auth.dto.RegisterRequest;
import com.idea.auth.dto.UserResponse;
import java.util.List;

/** Public contract for registration, login, token refresh and user lookups. */
public interface AuthService {

    /** All active students, for a teacher to assign exams to. */
    List<UserResponse> listStudents();

    /** Registers a new user and returns a token pair. */
    AuthResponse register(RegisterRequest request);

    /** Authenticates by email/password and returns a token pair. */
    AuthResponse login(LoginRequest request);

    /** Exchanges a valid refresh token for a new token pair (refresh rotation). */
    AuthResponse refresh(String refreshToken);
}
