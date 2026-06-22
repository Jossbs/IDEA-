package com.idea.attempt.web;

import com.idea.attempt.dto.ExamResultsResponse;
import com.idea.attempt.service.AttemptService;
import com.idea.auth.security.AuthenticatedUser;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Teacher's results panel for an exam, under {@code /api/exams} (TEACHER-only,
 * scoped to the owning teacher).
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
}
