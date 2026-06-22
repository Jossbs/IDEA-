package com.idea.attempt.web;

import com.idea.attempt.dto.AttemptReviewResponse;
import com.idea.attempt.dto.ExamResultsResponse;
import com.idea.attempt.dto.ReviewRequest;
import com.idea.attempt.service.AttemptService;
import com.idea.auth.security.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Teacher's results and manual-review endpoints for an exam, under
 * {@code /api/exams} (TEACHER-only, scoped to the owning teacher).
 */
@RestController
@RequestMapping("/api/exams")
public class ExamResultsController {

    private final AttemptService attemptService;

    public ExamResultsController(AttemptService attemptService) {
        this.attemptService = attemptService;
    }

    @GetMapping("/{id}/results")
    public ExamResultsResponse results(
            @PathVariable UUID id, @AuthenticationPrincipal AuthenticatedUser teacher) {
        return attemptService.getResults(id, teacher.userId());
    }

    /** The short-text answers of one attempt to grade manually. */
    @GetMapping("/{examId}/attempts/{attemptId}/review")
    public AttemptReviewResponse review(
            @PathVariable UUID examId,
            @PathVariable UUID attemptId,
            @AuthenticationPrincipal AuthenticatedUser teacher) {
        return attemptService.getReview(examId, attemptId, teacher.userId());
    }

    /** Applies the manual grades and marks the attempt graded. */
    @PostMapping("/{examId}/attempts/{attemptId}/review")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void submitReview(
            @PathVariable UUID examId,
            @PathVariable UUID attemptId,
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal AuthenticatedUser teacher) {
        attemptService.review(examId, attemptId, teacher.userId(), request);
    }

    /** Grants a retry: soft-deletes the attempt so the student can take it again. */
    @PostMapping("/{examId}/attempts/{attemptId}/reset")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetAttempt(
            @PathVariable UUID examId,
            @PathVariable UUID attemptId,
            @AuthenticationPrincipal AuthenticatedUser teacher) {
        attemptService.resetAttempt(examId, attemptId, teacher.userId());
    }
}
