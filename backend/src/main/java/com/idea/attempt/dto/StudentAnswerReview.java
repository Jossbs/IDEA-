package com.idea.attempt.dto;

import com.idea.exam.domain.QuestionType;
import java.util.List;
import java.util.UUID;

/**
 * One question as the student sees it after grading: the answer key revealed,
 * their selection marked, and the points they earned.
 *
 * <p>For {@code SHORT_TEXT}, {@code awardedPoints} is null (it is part of the
 * teacher's manual total, not stored per question) and {@code options} is empty.</p>
 */
public record StudentAnswerReview(
        UUID questionId,
        String questionText,
        QuestionType questionType,
        int points,
        Integer awardedPoints,
        boolean correct,
        boolean autoGraded,
        String answerText,
        List<StudentAnswerOption> options) {
}
