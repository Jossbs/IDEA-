package com.idea.attempt.web;

import com.idea.attempt.dto.AttemptResultResponse;
import com.idea.attempt.dto.StudentAttemptReview;
import com.idea.attempt.dto.StudentExamCard;
import com.idea.attempt.dto.SubmitAttemptRequest;
import com.idea.attempt.service.AttemptService;
import com.idea.auth.security.AuthenticatedUser;
import com.idea.exam.dto.StudentExamResponse;
import com.idea.exam.service.ExamService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Student-facing endpoints under {@code /api/student} (restricted to STUDENT).
 * Browse published exams, fetch the sanitized exam to take, and submit answers.
 */
@RestController
@RequestMapping("/api/student")
public class StudentExamController {

    private final ExamService examService;
    private final AttemptService attemptService;

    public StudentExamController(ExamService examService, AttemptService attemptService) {
        this.examService = examService;
        this.attemptService = attemptService;
    }

    /** Published exams available to take, flagged if already submitted. */
    @GetMapping("/exams")
    public List<StudentExamCard> available(@AuthenticationPrincipal AuthenticatedUser student) {
        return attemptService.listAvailableForStudent(student.userId());
    }

    /** Sanitized exam (no answer key) to render the runner. */
    @GetMapping("/exams/{id}")
    public StudentExamResponse take(
            @PathVariable UUID id, @AuthenticationPrincipal AuthenticatedUser student) {
        return examService.getExamForStudent(id, student.userId());
    }

    /** Submits the answers, auto-grades, and returns the result. */
    @PostMapping("/exams/{id}/attempts")
    public AttemptResultResponse submit(
            @PathVariable UUID id,
            @Valid @RequestBody SubmitAttemptRequest request,
            @AuthenticationPrincipal AuthenticatedUser student) {
        return attemptService.submit(id, student.userId(), request);
    }

    /** The student's own graded attempt with per-question corrections. */
    @GetMapping("/exams/{id}/result")
    public StudentAttemptReview result(
            @PathVariable UUID id, @AuthenticationPrincipal AuthenticatedUser student) {
        return attemptService.getMyResult(id, student.userId());
    }
}
