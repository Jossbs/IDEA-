package com.idea.auth.web;

import com.idea.auth.dto.UserResponse;
import com.idea.auth.service.AuthService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Read-only student directory for teachers under {@code /api/students}
 * (TEACHER-only), used to pick who an exam is assigned to.
 */
@RestController
@RequestMapping("/api/students")
public class StudentDirectoryController {

    private final AuthService authService;

    public StudentDirectoryController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping
    public List<UserResponse> list() {
        return authService.listStudents();
    }
}
