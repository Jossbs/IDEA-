package com.idea.exam.web;

import com.idea.exam.dto.SubjectActiveRequest;
import com.idea.exam.dto.SubjectRequest;
import com.idea.exam.dto.SubjectResponse;
import com.idea.exam.service.SubjectService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST endpoints for the subjects catalog under {@code /api/subjects}.
 */
@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @GetMapping
    public List<SubjectResponse> list(
            @RequestParam(name = "includeInactive", defaultValue = "false") boolean includeInactive) {
        return subjectService.findAll(includeInactive);
    }

    @GetMapping("/{id}")
    public SubjectResponse getOne(@PathVariable UUID id) {
        return subjectService.findById(id);
    }

    @PostMapping
    public ResponseEntity<SubjectResponse> create(@Valid @RequestBody SubjectRequest request) {
        SubjectResponse created = subjectService.create(request);
        URI location = URI.create("/api/subjects/" + created.subjectIdentifier());
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public SubjectResponse update(@PathVariable UUID id, @Valid @RequestBody SubjectRequest request) {
        return subjectService.update(id, request);
    }

    @PatchMapping("/{id}/active")
    public SubjectResponse setActive(@PathVariable UUID id, @Valid @RequestBody SubjectActiveRequest request) {
        return subjectService.setActive(id, request.active());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        subjectService.delete(id);
    }
}
