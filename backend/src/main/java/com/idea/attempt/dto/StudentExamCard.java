package com.idea.attempt.dto;

import com.idea.attempt.domain.AttemptStatus;
import com.idea.exam.domain.AcademicLevel;
import java.util.UUID;

/**
 * An assigned, published exam shown to a student. When already submitted it
 * carries the attempt outcome ({@code attemptStatus}, {@code score},
 * {@code maxScore}); those are null while the exam is still pending.
 */
public record StudentExamCard(
        UUID examId,
        String title,
        String subjectName,
        AcademicLevel academicLevel,
        int questionCount,
        boolean alreadyTaken,
        AttemptStatus attemptStatus,
        Integer score,
        Integer maxScore) {
}
