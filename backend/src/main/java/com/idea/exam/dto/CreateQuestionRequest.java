package com.idea.exam.dto;

import com.idea.exam.domain.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * A question with its options in the create-exam payload. {@code @Valid} on the
 * options list cascades validation (paths like {@code questions[0].options[1].optionText}).
 *
 * @param questionText the prompt (required)
 * @param questionType one of the {@link QuestionType} values
 * @param points       weight of the question (>= 1)
 * @param sortOrder    display order within the exam (>= 0)
 * @param options      at least two options, at least one marked correct
 */
public record CreateQuestionRequest(
        @NotBlank(message = "El texto de la pregunta es obligatorio.")
        String questionText,

        @NotNull(message = "El tipo de pregunta es obligatorio.")
        QuestionType questionType,

        @NotNull(message = "Los puntos son obligatorios.")
        @Min(value = 1, message = "Los puntos deben ser al menos 1.")
        Integer points,

        @NotNull(message = "El orden es obligatorio.")
        @PositiveOrZero(message = "El orden no puede ser negativo.")
        Integer sortOrder,

        @NotNull(message = "Cada pregunta debe tener opciones.")
        @Size(min = 2, message = "Cada pregunta debe tener al menos dos opciones.")
        @Valid
        List<CreateOptionRequest> options) {

    /** Strict rule: a question must have at least one correct option. */
    @AssertTrue(message = "Cada pregunta debe tener al menos una opción correcta.")
    public boolean isAtLeastOneCorrect() {
        return options != null && options.stream().anyMatch(CreateOptionRequest::correct);
    }
}
