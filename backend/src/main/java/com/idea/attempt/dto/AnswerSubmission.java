package com.idea.attempt.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

/**
 * One question's answer in a submission. Use {@code selectedOptionIds} for
 * choice/true-false (one or more option ids) and {@code answerText} for
 * short-text. Both may be empty for an unanswered question.
 */
public record AnswerSubmission(
        @NotNull(message = "La pregunta es obligatoria.")
        UUID questionId,

        List<UUID> selectedOptionIds,

        String answerText) {
}
