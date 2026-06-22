package com.idea.attempt.dto;

import com.idea.attempt.domain.AttemptStatus;
import java.time.LocalDateTime;

/**
 * Projection row for the teacher's results table: the student's name joined in,
 * plus the attempt's scores and status. Mapped to {@code ResultEntry} for output.
 */
public record AttemptResultRow(
        String studentName,
        LocalDateTime submittedAt,
        int autoScore,
        Integer manualScore,
        AttemptStatus status) {
}
