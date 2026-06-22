package com.idea.exam.dto;

import java.util.List;
import java.util.UUID;

/**
 * Internal read model the {@code attempt} module uses to grade a submission and
 * to render results. Carries the answer key, so it is never exposed to students.
 */
public record GradingExam(
        UUID examId,
        String title,
        String subjectName,
        UUID teacherId,
        boolean published,
        int maxScore,
        List<GradingQuestion> questions) {
}
