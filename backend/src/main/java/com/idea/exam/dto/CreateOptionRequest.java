package com.idea.exam.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * One answer option in the create-exam payload.
 *
 * @param optionText the answer text (required)
 * @param isCorrect  whether this option is correct (defaults to false if null)
 */
public record CreateOptionRequest(
        @NotBlank(message = "El texto de la opción es obligatorio.")
        String optionText,

        Boolean isCorrect) {

    /** Null-safe accessor — treats a missing flag as "not correct". */
    public boolean correct() {
        return Boolean.TRUE.equals(isCorrect);
    }
}
