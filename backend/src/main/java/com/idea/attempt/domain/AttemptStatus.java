package com.idea.attempt.domain;

/**
 * Lifecycle of a submitted attempt. {@code GRADED} when every question is
 * auto-gradable; {@code PENDING_REVIEW} when it has short-text answers that need
 * the teacher's manual grading before the final score is complete.
 */
public enum AttemptStatus {
    GRADED,
    PENDING_REVIEW
}
