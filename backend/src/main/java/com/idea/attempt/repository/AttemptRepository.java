package com.idea.attempt.repository;

import com.idea.attempt.domain.ExamAttempt;
import com.idea.attempt.dto.AttemptResultRow;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** Persistence access for {@link ExamAttempt}. Internal to the {@code attempt} module. */
public interface AttemptRepository extends JpaRepository<ExamAttempt, UUID> {

    boolean existsByExamIdAndStudentIdAndActiveRecordTrue(UUID examId, UUID studentId);

    /** All of a student's active attempts, to annotate their exam list. */
    List<ExamAttempt> findByStudentIdAndActiveRecordTrue(UUID studentId);

    /** A student's own attempt for an exam, with answers (to review corrections). */
    @EntityGraph(attributePaths = "answers")
    Optional<ExamAttempt> findByExamIdAndStudentIdAndActiveRecordTrue(UUID examId, UUID studentId);

    /** Result rows for a teacher's panel: joins the student's name from users. */
    @Query("""
            SELECT new com.idea.attempt.dto.AttemptResultRow(
                a.attemptId, u.fullName, a.submittedAt, a.autoScore, a.manualScore, a.status)
            FROM ExamAttempt a
            JOIN User u ON u.userId = a.studentId
            WHERE a.examId = :examId AND a.activeRecord = true
            ORDER BY a.submittedAt DESC""")
    List<AttemptResultRow> findResultRows(UUID examId);

    /** The student's display name for an attempt (review header). */
    @Query("""
            SELECT u.fullName FROM ExamAttempt a
            JOIN User u ON u.userId = a.studentId
            WHERE a.attemptId = :attemptId""")
    Optional<String> findStudentName(UUID attemptId);

    /** Loads an attempt with its answers eagerly (for the review screen). */
    @EntityGraph(attributePaths = "answers")
    Optional<ExamAttempt> findWithAnswersByAttemptId(UUID attemptId);
}
