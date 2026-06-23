package com.idea.exam.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Sanitized exam delivered to a student to take it: no correct-answer markers.
 * {@code durationMinutes} is null for now (no time limit until exams gain one).
 * Carries the scoring scale ({@code totalPoints}/{@code passingScore}) and the
 * delivery deadline ({@code dueAt}) so the runner can show them up front.
 */
public record StudentExamResponse(
        UUID examId,
        String title,
        Integer durationMinutes,
        int totalPoints,
        int passingScore,
        LocalDateTime dueAt,
        List<StudentQuestionResponse> questions) {
}
