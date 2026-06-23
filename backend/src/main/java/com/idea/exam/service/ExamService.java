package com.idea.exam.service;

import com.idea.exam.dto.CreateExamRequest;
import com.idea.exam.dto.ExamDetailResponse;
import com.idea.exam.dto.ExamSummaryResponse;
import com.idea.exam.dto.GradingExam;
import com.idea.exam.dto.StudentExamResponse;
import java.util.List;
import java.util.Map;
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

    /**
     * Replaces an exam's config, questions/options and assignments. Owner-scoped.
     *
     * @throws com.idea.shared.web.exception.ResourceNotFoundException if missing or not theirs
     * @throws com.idea.shared.web.exception.ConflictException if the exam already has submissions
     */
    void updateExam(UUID examId, UUID teacherId, CreateExamRequest request);

    /**
     * Duplicates an exam (config + questions/options) as a new unpublished draft
     * owned by the same teacher. Student assignments are intentionally not copied.
     *
     * @return the identifier of the new draft exam
     * @throws com.idea.shared.web.exception.ResourceNotFoundException if missing or not theirs
     */
    UUID duplicateExam(UUID examId, UUID teacherId);

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
     * Average submitted score (auto + manual) per exam across active attempts.
     * Exams with no attempts are absent from the map.
     */
    Map<UUID, Double> averageScores(List<UUID> examIds);

    /**
     * Replaces the set of students an exam is assigned to. Owner-scoped.
     *
     * @throws com.idea.shared.web.exception.ResourceNotFoundException if missing or not theirs
     */
    void assignStudents(UUID examId, UUID teacherId, List<UUID> studentIds);

    /**
     * Sanitized exam (no answer key) for a student to take. Must be published and
     * assigned to the requesting student.
     *
     * @throws com.idea.shared.web.exception.ResourceNotFoundException if missing,
     *     not published, or not assigned to the student
     */
    StudentExamResponse getExamForStudent(UUID examId, UUID studentId);

    /** Whether the exam is assigned to (and thus takeable by) the given student. */
    boolean isAssignedTo(UUID examId, UUID studentId);

    /**
     * Internal grading model (carries the answer key) for the {@code attempt} module.
     *
     * @throws com.idea.shared.web.exception.ResourceNotFoundException if the exam does not exist
     */
    GradingExam getGradingExam(UUID examId);
}
