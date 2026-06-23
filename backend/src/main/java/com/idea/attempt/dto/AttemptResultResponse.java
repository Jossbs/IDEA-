package com.idea.attempt.dto;

import com.idea.attempt.domain.AttemptStatus;
import java.util.UUID;

/**
 * Result returned to the student right after submitting. {@code score} is the
 * auto-graded total so far; when {@code status} is {@code PENDING_REVIEW} the
 * final grade is incomplete until the teacher reviews the short-text answers.
 * {@code passingScore} is the accreditation threshold so the student knows
 * whether they passed.
 */
public record AttemptResultResponse(
        UUID attemptId,
        AttemptStatus status,
        int score,
        int maxScore,
        int passingScore) {
}
