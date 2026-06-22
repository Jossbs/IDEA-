package com.idea.exam.dto;

import java.util.List;
import java.util.UUID;

/**
 * Sanitized exam delivered to a student to take it: no correct-answer markers.
 * {@code durationMinutes} is null for now (no time limit until exams gain one).
 */
public record StudentExamResponse(
        UUID examId,
        String title,
        Integer durationMinutes,
        List<StudentQuestionResponse> questions) {
}
