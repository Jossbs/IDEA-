package com.idea.attempt.dto;

import java.util.UUID;

/** One short-text question to grade manually, with the student's answer. */
public record ReviewItem(
        UUID questionId,
        String questionText,
        int maxPoints,
        String answerText) {
}
