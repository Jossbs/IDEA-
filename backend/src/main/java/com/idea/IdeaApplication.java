package com.idea;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the IDEA backend — a modular monolith.
 *
 * <p>Modules live under {@code com.idea.*} and communicate only through their
 * public service interfaces:</p>
 * <ul>
 *   <li>{@code auth}    — identity, JWT, roles</li>
 *   <li>{@code exam}    — exams, subjects, questions</li>
 *   <li>{@code attempt} — attempt lifecycle, timer, autosave</li>
 *   <li>{@code grading} — automatic and manual grading</li>
 *   <li>{@code shared}  — cross-cutting configuration and utilities</li>
 * </ul>
 */
@SpringBootApplication
public class IdeaApplication {

    public static void main(String[] args) {
        SpringApplication.run(IdeaApplication.class, args);
    }
}
