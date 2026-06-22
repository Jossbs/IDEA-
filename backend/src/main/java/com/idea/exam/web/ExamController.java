package com.idea.exam.web;

import com.idea.exam.dto.CreateExamRequest;
import com.idea.exam.dto.CreateExamResponse;
import com.idea.exam.service.ExamService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST endpoints for exam authoring under {@code /api/exams}.
 */
@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    /**
     * Creates a full exam (with nested questions and options) from a single
     * payload. Validation runs before this method; persistence is transactional.
     */
    @PostMapping
    public ResponseEntity<CreateExamResponse> store(@Valid @RequestBody CreateExamRequest request) {
        UUID examId = examService.createExam(request);
        URI location = URI.create("/api/exams/" + examId);
        return ResponseEntity.created(location)
                .body(new CreateExamResponse(examId, "Examen creado correctamente."));
    }
}
