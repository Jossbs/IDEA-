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
        LocalDateTime updateTimestamp,
        int totalPoints,
        int passingScore,
        LocalDateTime dueAt,
        /** Average submitted score across attempts; null when there are none. */
        Double averageScore) {

    /**
     * Projection constructor used by the JPQL queries (which don't compute the
     * average). The service fills {@code averageScore} in a second step.
     */
    public ExamSummaryResponse(
            UUID examId,
            String title,
            String subjectName,
            AcademicLevel academicLevel,
            boolean published,
            int questionCount,
            LocalDateTime updateTimestamp,
            int totalPoints,
            int passingScore,
            LocalDateTime dueAt) {
        this(examId, title, subjectName, academicLevel, published, questionCount,
                updateTimestamp, totalPoints, passingScore, dueAt, null);
    }

    /** Returns a copy carrying the given average score. */
    public ExamSummaryResponse withAverage(Double average) {
        return new ExamSummaryResponse(examId, title, subjectName, academicLevel, published,
                questionCount, updateTimestamp, totalPoints, passingScore, dueAt, average);
    }
}
