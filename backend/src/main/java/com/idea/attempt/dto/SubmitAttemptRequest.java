package com.idea.attempt.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/** A student's full set of answers for an exam submission. */
public record SubmitAttemptRequest(
        @NotNull(message = "Las respuestas son obligatorias.")
        @Valid
        List<AnswerSubmission> answers) {
}
