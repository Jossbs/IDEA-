package com.idea.exam.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Payload for the soft-delete toggle: deactivate or reactivate a subject.
 *
 * @param active target state — {@code false} deactivates, {@code true} restores
 */
public record SubjectActiveRequest(
        @NotNull(message = "El estado activo es obligatorio.")
        Boolean active) {
}
