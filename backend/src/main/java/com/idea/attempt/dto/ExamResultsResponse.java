package com.idea.attempt.dto;

import java.util.List;
import java.util.UUID;

/**
 * Teacher's results panel for one exam: header (title, subject, scales) plus the
 * list of student attempts. {@code passingScore} is a 60%-of-max convention for
 * the MVP (configurable per exam later).
 */
public record ExamResultsResponse(
        UUID examId,
        String examTitle,
        String subjectName,
        int maxScore,
        int passingScore,
        List<ResultEntry> results) {
}
