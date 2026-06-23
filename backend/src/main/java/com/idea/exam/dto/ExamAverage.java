package com.idea.exam.dto;

import java.util.UUID;

/**
 * Aggregate row: an exam's average submitted score (auto + manual) across its
 * active attempts. {@code averageScore} is null only when an exam id has no
 * attempts (such ids are simply absent from the query result).
 */
public record ExamAverage(UUID examId, Double averageScore) {
}
