package com.idea.attempt.service;

import com.idea.attempt.dto.AttemptResultResponse;
import com.idea.attempt.dto.AttemptReviewResponse;
import com.idea.attempt.dto.ExamResultsResponse;
import com.idea.attempt.dto.ReviewRequest;
import com.idea.attempt.dto.StudentExamCard;
import com.idea.attempt.dto.SubmitAttemptRequest;
import java.util.List;
import java.util.UUID;

/** Public contract for taking exams, grading, results and manual review. */
public interface AttemptService {

    /** Published exams for a student, flagged with whether they already submitted. */
    List<StudentExamCard> listAvailableForStudent(UUID studentId);

    /**
     * Records and auto-grades a student's submission for a published exam.
     *
     * @throws com.idea.shared.web.exception.ResourceNotFoundException if the exam is missing/unpublished
     * @throws com.idea.shared.web.exception.DuplicateResourceException if the student already submitted it
     */
    AttemptResultResponse submit(UUID examId, UUID studentId, SubmitAttemptRequest request);

    /**
     * The results panel for an exam, restricted to its owning teacher.
     *
     * @throws com.idea.shared.web.exception.ResourceNotFoundException if missing or not theirs
     */
    ExamResultsResponse getResults(UUID examId, UUID teacherId);

    /**
     * The manual-review model for one attempt (owner-scoped to the exam's teacher).
     *
     * @throws com.idea.shared.web.exception.ResourceNotFoundException if missing or not theirs
     */
    AttemptReviewResponse getReview(UUID examId, UUID attemptId, UUID teacherId);

    /**
     * Applies the teacher's manual grades to an attempt's short-text answers,
     * sets the manual score and marks it GRADED.
     */
    void review(UUID examId, UUID attemptId, UUID teacherId, ReviewRequest request);
}
