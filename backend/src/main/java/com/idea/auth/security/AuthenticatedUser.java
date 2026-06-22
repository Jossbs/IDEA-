package com.idea.auth.security;

import com.idea.auth.domain.Role;
import java.util.UUID;

/**
 * Lightweight principal carried in the security context for an authenticated
 * request. Built from the access-token claims (no per-request DB lookup), so
 * controllers can read the caller's id/role via {@code @AuthenticationPrincipal}.
 */
public record AuthenticatedUser(UUID userId, String email, Role role) {
}
