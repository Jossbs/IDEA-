package com.idea.exam.service;

import com.idea.exam.dto.CreateExamRequest;
import com.idea.exam.dto.ExamDetailResponse;
import com.idea.exam.dto.ExamSummaryResponse;
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
}
