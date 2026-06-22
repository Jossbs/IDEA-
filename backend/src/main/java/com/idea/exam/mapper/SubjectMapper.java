package com.idea.exam.mapper;

import com.idea.exam.domain.Subject;
import com.idea.exam.dto.SubjectRequest;
import com.idea.exam.dto.SubjectResponse;

/**
 * Maps between {@link Subject} entities and their DTOs. Kept as plain static
 * methods — no mapping framework needed for a model this small.
 */
public final class SubjectMapper {

    private SubjectMapper() {
    }

    public static Subject toEntity(SubjectRequest request) {
        Subject subject = new Subject();
        applyRequest(subject, request);
        return subject;
    }

    /** Copies editable fields from a request onto an existing entity. */
    public static void applyRequest(Subject subject, SubjectRequest request) {
        subject.setSubjectName(request.subjectName().trim());
        subject.setAcademicLevel(request.academicLevel());
    }

    public static SubjectResponse toResponse(Subject subject) {
        return new SubjectResponse(
                subject.getSubjectIdentifier(),
                subject.getSubjectName(),
                subject.getAcademicLevel(),
                subject.isActiveRecord(),
                subject.getCreationTimestamp(),
                subject.getUpdateTimestamp());
    }
}
