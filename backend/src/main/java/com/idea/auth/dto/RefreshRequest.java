package com.idea.auth.dto;

import jakarta.validation.constraints.NotBlank;

/** Exchanges a valid refresh token for a fresh access (and refresh) token. */
public record RefreshRequest(
        @NotBlank(message = "El token de actualización es obligatorio.")
        String refreshToken) {
}
