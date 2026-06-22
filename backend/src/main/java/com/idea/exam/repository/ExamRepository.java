package com.idea.exam.repository;

import com.idea.exam.domain.Exam;
import com.idea.exam.dto.ExamSummaryResponse;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** Persistence access for {@link Exam}. Questions/options cascade through it. */
public interface ExamRepository extends JpaRepository<Exam, UUID> {

    /**
     * Active exams as flat summaries for the dashboard. Joins the subject (same
     * module) for its name/level and counts questions — one query, no N+1.
     */
    @Query("""
            SELECT new com.idea.exam.dto.ExamSummaryResponse(
                e.examId, e.title, s.subjectName, s.academicLevel,
                e.published, SIZE(e.questions), e.updateTimestamp)
            FROM Exam e
            JOIN Subject s ON s.subjectIdentifier = e.subjectId
            WHERE e.activeRecord = true AND e.teacherId = :teacherId
            ORDER BY e.updateTimestamp DESC""")
    List<ExamSummaryResponse> findSummariesByTeacher(UUID teacherId);

    /** Fetches one exam with its questions eagerly (options load lazily within the tx). */
    @EntityGraph(attributePaths = "questions")
    Optional<Exam> findWithQuestionsByExamId(UUID examId);
}
