package com.idea.exam.dto;

import com.idea.exam.domain.AcademicLevel;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Read model returned to clients for a subject.
 */
public record SubjectResponse(
        UUID subjectIdentifier,
        String subjectName,
        AcademicLevel academicLevel,
        boolean activeRecord,
        LocalDateTime creationTimestamp,
        LocalDateTime updateTimestamp) {
}
