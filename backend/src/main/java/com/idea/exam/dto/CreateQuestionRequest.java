package com.idea.exam.dto;

import com.idea.exam.domain.DifficultyLevel;
import com.idea.exam.domain.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.List;

/**
 * A question with its options in the create-exam payload. {@code @Valid} on the
 * options list cascades validation (paths like {@code questions[0].options[1].optionText}).
 *
 * <p>Option rules are <b>type-aware</b>: {@code SHORT_TEXT} carries no options
 * (graded manually); {@code TRUE_FALSE} has exactly two; choice types need at
 * least two. The number of correct options also depends on the type.</p>
 *
 * @param questionText    the prompt (required)
 * @param questionType    one of the {@link QuestionType} values
 * @param difficultyLevel one of the {@link DifficultyLevel} values
 * @param points          weight of the question (>= 1)
 * @param sortOrder       display order within the exam (>= 0)
 * @param options         options whose count/correctness depend on the type
 */
public record CreateQuestionRequest(
        @NotBlank(message = "El texto de la pregunta es obligatorio.")
        String questionText,

        @NotNull(message = "El tipo de pregunta es obligatorio.")
        QuestionType questionType,

        @NotNull(message = "La dificultad es obligatoria.")
        DifficultyLevel difficultyLevel,

        @NotNull(message = "Los puntos son obligatorios.")
        @Min(value = 1, message = "Los puntos deben ser al menos 1.")
        Integer points,

        @NotNull(message = "El orden es obligatorio.")
        @PositiveOrZero(message = "El orden no puede ser negativo.")
        Integer sortOrder,

        @Valid
        List<CreateOptionRequest> options) {

    private int correctCount() {
        return options == null
                ? 0
                : (int) options.stream().filter(CreateOptionRequest::correct).count();
    }

    /** The right number of options for the question type. */
    @AssertTrue(message = "El número de opciones no es válido para el tipo de pregunta.")
    public boolean isOptionCountValid() {
        if (questionType == null) {
            return true; // the @NotNull on questionType reports the real error
        }
        return switch (questionType) {
            case SHORT_TEXT -> options == null || options.isEmpty();
            case TRUE_FALSE -> options != null && options.size() == 2;
            case SINGLE_CHOICE, MULTIPLE_CHOICE -> options != null && options.size() >= 2;
        };
    }

    /** The right number of correct options for the question type. */
    @AssertTrue(message = "La cantidad de opciones correctas no es válida para el tipo de pregunta.")
    public boolean isCorrectCountValid() {
        if (questionType == null) {
            return true;
        }
        return switch (questionType) {
            case SHORT_TEXT -> true; // graded manually; no correct option at authoring
            case SINGLE_CHOICE, TRUE_FALSE -> correctCount() == 1;
            case MULTIPLE_CHOICE -> correctCount() >= 1;
        };
    }
}
