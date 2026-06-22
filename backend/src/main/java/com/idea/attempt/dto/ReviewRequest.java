package com.idea.attempt.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/** Manual grades for an attempt's short-text answers. */
public record ReviewRequest(
        @NotNull(message = "Las calificaciones son obligatorias.")
        @Valid
        List<QuestionGrade> grades) {
}
