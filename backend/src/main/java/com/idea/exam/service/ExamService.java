package com.idea.exam.service;

import com.idea.exam.dto.CreateExamRequest;
import com.idea.exam.dto.ExamDetailResponse;
import com.idea.exam.dto.ExamSummaryResponse;
import com.idea.exam.dto.GradingExam;
import com.idea.exam.dto.StudentExamResponse;
import java.util.List;
import java.util.UUID;

/** Public contract for exam authoring and reading. */
public interface ExamService {

    /**
     * Persists an exam (with its questions and options) atomically, owned by the
     * given teacher.
     *
     * @return the identifier of the newly created exam
     */
    UUID createExam(CreateExamRequest request, UUID teacherId);

    /** The given teacher's active exams as flat summaries for the dashboard. */
    List<ExamSummaryResponse> listExams(UUID teacherId);

    /**
     * Full detail (questions + options) of a single active exam owned by the teacher.
     *
     * @throws com.idea.shared.web.exception.ResourceNotFoundException if it does not exist or is not theirs
     */
    ExamDetailResponse getExam(UUID examId, UUID teacherId);

    /** Published, active exams assigned to (and takeable by) the given student. */
    List<ExamSummaryResponse> listAssignedPublishedExams(UUID studentId);

    /**
     * Replaces the set of students an exam is assigned to. Owner-scoped.
     *
     * @throws com.idea.shared.web.exception.ResourceNotFoundException if missing or not theirs
     */
    void assignStudents(UUID examId, UUID teacherId, List<UUID> studentIds);

    /**
     * Sanitized exam (no answer key) for a student to take. Must be published.
     *
     * @throws com.idea.shared.web.exception.ResourceNotFoundException if missing or not published
     */
    StudentExamResponse getExamForStudent(UUID examId);

    /**
     * Internal grading model (carries the answer key) for the {@code attempt} module.
     *
     * @throws com.idea.shared.web.exception.ResourceNotFoundException if the exam does not exist
     */
    GradingExam getGradingExam(UUID examId);
}
