package com.idea.exam.dto;

import com.idea.exam.domain.AcademicLevel;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Read model for the teacher's exam list. Flattens the subject name/level and
 * the question count so the dashboard renders without extra round-trips. Built
 * directly by a JPQL constructor projection (see {@code ExamRepository}).
 */
public record ExamSummaryResponse(
        UUID examId,
        String title,
        String subjectName,
        AcademicLevel academicLevel,
        boolean published,
        int questionCount,
        LocalDateTime updateTimestamp) {
}
