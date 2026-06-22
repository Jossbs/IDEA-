package com.idea.attempt.dto;

import java.util.UUID;

/** One option in a student's reviewed answer: whether it is correct and chosen. */
public record StudentAnswerOption(
        UUID optionId,
        String optionText,
        boolean correct,
        boolean selected) {
}
