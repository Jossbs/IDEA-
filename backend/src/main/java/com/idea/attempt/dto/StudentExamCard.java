package com.idea.attempt.dto;

import com.idea.attempt.domain.AttemptStatus;
import com.idea.exam.domain.AcademicLevel;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * An assigned, published exam shown to a student. Carries the scoring scale
 * ({@code totalPoints}/{@code passingScore}) and delivery deadline ({@code dueAt})
 * up front. When already submitted it also carries the attempt outcome
 * ({@code attemptStatus}, {@code score}, {@code maxScore}); those are null while
 * the exam is still pending.
 */
public record StudentExamCard(
        UUID examId,
        String title,
        String subjectName,
        AcademicLevel academicLevel,
        int questionCount,
        int totalPoints,
        int passingScore,
        LocalDateTime dueAt,
        boolean alreadyTaken,
        AttemptStatus attemptStatus,
        Integer score,
        Integer maxScore,
        /** Group average score across all submissions; null when there are none. */
        Double averageScore) {
}
