package com.idea.exam.service;

import com.idea.exam.dto.CreateExamRequest;
import com.idea.exam.dto.ExamDetailResponse;
import com.idea.exam.dto.ExamSummaryResponse;
import java.util.List;
import java.util.UUID;

/** Public contract for exam authoring and reading. */
public interface ExamService {

    /**
     * Persists an exam with its questions and options atomically.
     *
     * @return the identifier of the newly created exam
     */
    UUID createExam(CreateExamRequest request);

    /** Active exams as flat summaries for the teacher dashboard. */
    List<ExamSummaryResponse> listExams();

    /**
     * Full detail (questions + options) of a single active exam.
     *
     * @throws com.idea.shared.web.exception.ResourceNotFoundException if it does not exist
     */
    ExamDetailResponse getExam(UUID examId);
}
