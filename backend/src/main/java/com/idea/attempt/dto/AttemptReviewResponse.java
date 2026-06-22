package com.idea.attempt.dto;

import com.idea.attempt.domain.AttemptStatus;
import java.util.List;
import java.util.UUID;

/**
 * The teacher's manual-review model for one attempt: the auto-graded total, the
 * exam's max, and the short-text answers that still need points.
 */
public record AttemptReviewResponse(
        UUID attemptId,
        String studentName,
        int autoScore,
        int maxScore,
        AttemptStatus status,
        List<ReviewItem> items) {
}
