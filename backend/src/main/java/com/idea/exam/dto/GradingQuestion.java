package com.idea.exam.dto;

import com.idea.exam.domain.QuestionType;
import java.util.Set;
import java.util.UUID;

/**
 * One question's grading facts: its weight and the set of correct option ids.
 * {@code SHORT_TEXT} has an empty correct set (graded manually).
 */
public record GradingQuestion(
        UUID questionId,
        QuestionType questionType,
        int points,
        Set<UUID> correctOptionIds) {

    public boolean isAutoGradable() {
        return questionType != QuestionType.SHORT_TEXT;
    }
}
