package com.idea.exam.dto;

import com.idea.exam.domain.DifficultyLevel;
import com.idea.exam.domain.QuestionType;
import java.util.List;
import java.util.UUID;

/** Read model for a question within an exam detail. */
public record QuestionResponse(
        UUID questionId,
        String questionText,
        QuestionType questionType,
        DifficultyLevel difficultyLevel,
        int points,
        int sortOrder,
        List<OptionResponse> options) {
}
