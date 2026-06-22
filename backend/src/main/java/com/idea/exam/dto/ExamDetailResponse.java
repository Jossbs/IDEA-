package com.idea.exam.dto;

import com.idea.exam.domain.AcademicLevel;
import java.util.List;
import java.util.UUID;

/**
 * Read model for a full exam (teacher view): general config plus the ordered
 * questions and their options. Foundation for the edit/preview screens.
 */
public record ExamDetailResponse(
        UUID examId,
        String title,
        String description,
        UUID subjectId,
        String subjectName,
        AcademicLevel academicLevel,
        boolean published,
        List<UUID> assignedStudentIds,
        List<QuestionResponse> questions) {
}
