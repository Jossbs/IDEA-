package com.idea.auth.dto;

import jakarta.validation.constraints.NotBlank;

/** Login payload: email + raw password. */
public record LoginRequest(
        @NotBlank(message = "El correo es obligatorio.")
        String email,

        @NotBlank(message = "La contraseña es obligatoria.")
        String password) {
}
