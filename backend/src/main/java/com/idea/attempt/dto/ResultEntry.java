package com.idea.attempt.dto;

import com.idea.attempt.domain.AttemptStatus;
import java.time.LocalDateTime;

/** One student's row in the teacher's results table. */
public record ResultEntry(
        String studentName,
        LocalDateTime submittedAt,
        int score,
        AttemptStatus status,
        boolean pendingReview) {
}
