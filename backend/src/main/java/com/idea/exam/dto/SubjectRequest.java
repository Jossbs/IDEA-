package com.idea.exam.dto;

import com.idea.exam.domain.AcademicLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Payload to create or update a subject. Validated before reaching the service.
 *
 * @param subjectName   main subject name (required, unique)
 * @param academicLevel required level from the constrained catalog
 */
public record SubjectRequest(
        @NotBlank(message = "El nombre de la materia es obligatorio.")
        @Size(max = 100, message = "El nombre no puede exceder 100 caracteres.")
        String subjectName,

        @NotNull(message = "El nivel académico es obligatorio.")
        AcademicLevel academicLevel) {
}
