package com.idea.exam.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

/** Replaces the set of students an exam is assigned to (empty clears it). */
public record AssignStudentsRequest(
        @NotNull(message = "La lista de alumnos es obligatoria (puede ir vacía).")
        List<UUID> studentIds) {
}
