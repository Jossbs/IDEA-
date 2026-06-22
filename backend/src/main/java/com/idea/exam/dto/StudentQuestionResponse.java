package com.idea.exam.dto;

import com.idea.exam.domain.QuestionType;
import java.util.List;
import java.util.UUID;

/** Student-facing question: carries the type (to render the right input) but no answer key. */
public record StudentQuestionResponse(
        UUID questionId,
        String questionText,
        QuestionType questionType,
        int points,
        List<StudentOptionResponse> options) {
}
