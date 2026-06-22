package com.idea.exam.domain;

/**
 * Constrained catalog of academic levels a subject can belong to.
 *
 * <p>Modeled as an enum (not free text) so the UI renders it as a dropdown and
 * typing errors are impossible. Stored as its {@code name()} string in the
 * {@code academic_level} column; human-readable labels are localized in the
 * frontend.</p>
 */
public enum AcademicLevel {
    PRIMARY,
    SECONDARY,
    HIGH_SCHOOL,
    UNIVERSITY,
    POSTGRADUATE
}
