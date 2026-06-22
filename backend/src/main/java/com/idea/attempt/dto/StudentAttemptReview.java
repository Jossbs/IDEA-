package com.idea.attempt.dto;

import com.idea.attempt.domain.AttemptStatus;
import java.util.List;
import java.util.UUID;

/** A student's graded attempt with per-question corrections, for self review. */
public record StudentAttemptReview(
        UUID examId,
        String examTitle,
        AttemptStatus status,
        int score,
        int maxScore,
        List<StudentAnswerReview> questions) {
}
