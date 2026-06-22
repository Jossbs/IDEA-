package com.idea.attempt.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.UUID;

/** Points the teacher awards to one short-text question. */
public record QuestionGrade(
        @NotNull(message = "La pregunta es obligatoria.")
        UUID questionId,

        @NotNull(message = "Los puntos son obligatorios.")
        @PositiveOrZero(message = "Los puntos no pueden ser negativos.")
        Integer points) {
}
