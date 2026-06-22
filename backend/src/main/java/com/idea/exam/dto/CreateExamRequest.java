package com.idea.exam.dto;

import com.idea.exam.validation.SubjectExists;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

/**
 * Root payload to create a full exam with its nested questions and options.
 * Nested validation cascades via {@code @Valid} on the questions list.
 *
 * @param title       exam title (required, max 150)
 * @param subjectId   existing subject this exam belongs to
 * @param description optional instructions for students
 * @param isPublished draft vs. published (defaults to false if null)
 * @param questions   at least one question
 */
public record CreateExamRequest(
        @NotBlank(message = "El título del examen es obligatorio.")
        @Size(max = 150, message = "El título no puede exceder 150 caracteres.")
        String title,

        @NotNull(message = "La materia es obligatoria.")
        @SubjectExists
        UUID subjectId,

        String description,

        Boolean isPublished,

        @NotEmpty(message = "El examen debe tener al menos una pregunta.")
        @Valid
        List<CreateQuestionRequest> questions,

        /** Students this exam is directed to (optional; can be assigned later). */
        List<UUID> studentIds) {

    /** Null-safe accessor — an unspecified flag means "draft". */
    public boolean published() {
        return Boolean.TRUE.equals(isPublished);
    }
}
