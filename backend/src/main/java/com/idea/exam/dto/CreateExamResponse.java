package com.idea.exam.dto;

import java.util.UUID;

/** Standardized success body returned after creating an exam. */
public record CreateExamResponse(UUID examId, String message) {
}
