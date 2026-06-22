package com.idea.auth.dto;

import com.idea.auth.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Open self-registration payload (MVP): the user picks their own role.
 *
 * @param email    login email (unique, case-insensitive)
 * @param password raw password (min 8 chars; stored hashed)
 * @param fullName display name
 * @param role     TEACHER or STUDENT
 */
public record RegisterRequest(
        @NotBlank(message = "El correo es obligatorio.")
        @Email(message = "El correo no es válido.")
        @Size(max = 255, message = "El correo no puede exceder 255 caracteres.")
        String email,

        @NotBlank(message = "La contraseña es obligatoria.")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres.")
        String password,

        @NotBlank(message = "El nombre es obligatorio.")
        @Size(max = 150, message = "El nombre no puede exceder 150 caracteres.")
        String fullName,

        @NotNull(message = "El rol es obligatorio.")
        Role role) {
}
