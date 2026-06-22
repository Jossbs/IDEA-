package com.idea.exam.service;

import com.idea.exam.dto.CreateExamRequest;
import java.util.UUID;

/** Public contract for exam authoring. */
public interface ExamService {

    /**
     * Persists an exam with its questions and options atomically.
     *
     * @return the identifier of the newly created exam
     */
    UUID createExam(CreateExamRequest request);
}
