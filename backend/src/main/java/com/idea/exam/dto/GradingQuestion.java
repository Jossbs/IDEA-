package com.idea.exam.dto;

import com.idea.exam.domain.QuestionType;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * One question's grading facts: its weight and its options (with the answer key).
 * {@code SHORT_TEXT} has no correct options (graded manually).
 */
public record GradingQuestion(
        UUID questionId,
        String questionText,
        QuestionType questionType,
        int points,
        List<GradingOption> options) {

    public boolean isAutoGradable() {
        return questionType != QuestionType.SHORT_TEXT;
    }

    /** Ids of the options flagged as correct (derived from {@link #options()}). */
    public Set<UUID> correctOptionIds() {
        return options.stream()
                .filter(GradingOption::correct)
                .map(GradingOption::optionId)
                .collect(Collectors.toSet());
    }
}
