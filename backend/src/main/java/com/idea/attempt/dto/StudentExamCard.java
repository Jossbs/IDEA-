package com.idea.attempt.dto;

import com.idea.exam.domain.AcademicLevel;
import java.util.UUID;

/** A published exam shown to a student, flagged if they already submitted it. */
public record StudentExamCard(
        UUID examId,
        String title,
        String subjectName,
        AcademicLevel academicLevel,
        int questionCount,
        boolean alreadyTaken) {
}
