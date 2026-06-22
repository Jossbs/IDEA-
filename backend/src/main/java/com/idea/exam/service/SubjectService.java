package com.idea.exam.service;

import com.idea.exam.dto.SubjectRequest;
import com.idea.exam.dto.SubjectResponse;
import java.util.List;
import java.util.UUID;

/**
 * Public contract of the subjects catalog. Other modules depend on this
 * interface, never on the entity or repository directly.
 */
public interface SubjectService {

    /**
     * Lists subjects ordered by name.
     *
     * @param includeInactive when {@code false}, only active records are returned
     */
    List<SubjectResponse> findAll(boolean includeInactive);

    SubjectResponse findById(UUID subjectIdentifier);

    SubjectResponse create(SubjectRequest request);

    SubjectResponse update(UUID subjectIdentifier, SubjectRequest request);

    /** Soft-delete toggle: deactivates or restores a subject. */
    SubjectResponse setActive(UUID subjectIdentifier, boolean active);

    /** Permanently removes a subject. */
    void delete(UUID subjectIdentifier);
}
