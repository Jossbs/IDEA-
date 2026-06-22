package com.idea.exam.web;

import com.idea.auth.security.AuthenticatedUser;
import com.idea.exam.dto.AssignStudentsRequest;
import com.idea.exam.dto.CreateExamRequest;
import com.idea.exam.dto.CreateExamResponse;
import com.idea.exam.dto.ExamDetailResponse;
import com.idea.exam.dto.ExamSummaryResponse;
import com.idea.exam.service.ExamService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST endpoints for exam authoring under {@code /api/exams}. Restricted to
 * teachers; every operation is scoped to the authenticated teacher.
 */
@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    /**
     * Creates a full exam (with nested questions and options) owned by the caller.
     * Validation runs before this method; persistence is transactional.
     */
    @PostMapping
    public ResponseEntity<CreateExamResponse> store(
            @Valid @RequestBody CreateExamRequest request,
            @AuthenticationPrincipal AuthenticatedUser teacher) {
        UUID examId = examService.createExam(request, teacher.userId());
        URI location = URI.create("/api/exams/" + examId);
        return ResponseEntity.created(location)
                .body(new CreateExamResponse(examId, "Examen creado correctamente."));
    }

    /** Lists the authenticated teacher's active exams as dashboard summaries. */
    @GetMapping
    public List<ExamSummaryResponse> list(@AuthenticationPrincipal AuthenticatedUser teacher) {
        return examService.listExams(teacher.userId());
    }

    /** Full detail (questions + options + assigned students) of one of the teacher's exams. */
    @GetMapping("/{id}")
    public ExamDetailResponse getOne(
            @PathVariable UUID id, @AuthenticationPrincipal AuthenticatedUser teacher) {
        return examService.getExam(id, teacher.userId());
    }

    /** Updates an exam (config + questions/options + assignments). Blocked if it has submissions. */
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void update(
            @PathVariable UUID id,
            @Valid @RequestBody CreateExamRequest request,
            @AuthenticationPrincipal AuthenticatedUser teacher) {
        examService.updateExam(id, teacher.userId(), request);
    }

    /** Replaces the set of students this exam is assigned to. */
    @PutMapping("/{id}/assignments")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void assign(
            @PathVariable UUID id,
            @Valid @RequestBody AssignStudentsRequest request,
            @AuthenticationPrincipal AuthenticatedUser teacher) {
        examService.assignStudents(id, teacher.userId(), request.studentIds());
    }
}
