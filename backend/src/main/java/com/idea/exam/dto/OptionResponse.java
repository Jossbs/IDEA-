package com.idea.exam.dto;

import java.util.UUID;

/**
 * Read model for an answer option. Teacher-facing, so it carries {@code isCorrect};
 * the student-facing (sanitized) view will be a separate model once attempts land.
 */
public record OptionResponse(
        UUID optionId,
        String optionText,
        boolean isCorrect) {
}
