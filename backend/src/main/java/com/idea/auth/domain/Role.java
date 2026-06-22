package com.idea.auth.domain;

/**
 * Application role. {@code TEACHER} authors and grades exams; {@code STUDENT}
 * takes them. Stored as its {@code name()} in {@code users.role} and exposed to
 * Spring Security as authority {@code ROLE_TEACHER} / {@code ROLE_STUDENT}.
 */
public enum Role {
    TEACHER,
    STUDENT
}
