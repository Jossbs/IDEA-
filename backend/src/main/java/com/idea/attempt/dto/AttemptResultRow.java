package com.idea.attempt.dto;

import com.idea.attempt.domain.AttemptStatus;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Projection row for the teacher's results table: the student's name joined in,
 * plus the attempt's scores and status. Mapped to {@code ResultEntry} for output.
 */
public record AttemptResultRow(
        UUID attemptId,
        String studentName,
        LocalDateTime submittedAt,
        int autoScore,
        Integer manualScore,
        AttemptStatus status) {
}
