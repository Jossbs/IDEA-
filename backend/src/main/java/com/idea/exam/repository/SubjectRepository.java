package com.idea.exam.repository;

import com.idea.exam.domain.Subject;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Persistence access for {@link Subject}. Internal to the {@code exam} module —
 * other modules must go through {@code SubjectService}, never this repository.
 */
public interface SubjectRepository extends JpaRepository<Subject, UUID> {

    List<Subject> findAllByActiveRecordTrueOrderBySubjectNameAsc();

    List<Subject> findAllByOrderBySubjectNameAsc();

    boolean existsBySubjectNameIgnoreCase(String subjectName);

    boolean existsBySubjectNameIgnoreCaseAndSubjectIdentifierNot(String subjectName, UUID subjectIdentifier);
}
