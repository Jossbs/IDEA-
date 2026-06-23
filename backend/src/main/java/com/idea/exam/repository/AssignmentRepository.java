package com.idea.exam.repository;

import com.idea.exam.domain.ExamAssignment;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

/** Persistence access for exam→student {@link ExamAssignment}s. */
public interface AssignmentRepository extends JpaRepository<ExamAssignment, UUID> {

    @Query("SELECT a.studentId FROM ExamAssignment a WHERE a.examId = :examId")
    List<UUID> findStudentIdsByExamId(UUID examId);

    /** Whether a given exam is assigned to (and thus takeable by) a given student. */
    boolean existsByExamIdAndStudentId(UUID examId, UUID studentId);

    /**
     * Bulk delete executed immediately, so a subsequent re-insert of the same
     * (exam, student) pair can't collide with the unique index (Hibernate would
     * otherwise order inserts before the delete at flush).
     */
    @Modifying
    @Query("DELETE FROM ExamAssignment a WHERE a.examId = :examId")
    void deleteByExamId(UUID examId);
}
