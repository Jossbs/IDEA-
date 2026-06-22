-- ───────────────────────────────────────────────────────────
-- V1 — subjects catalog
-- The foundational entity. It establishes the system-wide conventions
-- every later table reuses: UUID primary keys, verbose snake_case names,
-- soft-delete via is_active_record, and audit timestamps.
-- ───────────────────────────────────────────────────────────
CREATE TABLE subjects (
    subject_identifier      UUID         NOT NULL DEFAULT gen_random_uuid(),
    subject_name            VARCHAR(100) NOT NULL,
    academic_level          VARCHAR(50)  NOT NULL,
    is_active_record        BOOLEAN      NOT NULL DEFAULT TRUE,
    creation_timestamp      TIMESTAMP    NOT NULL DEFAULT NOW(),
    update_timestamp        TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_subjects PRIMARY KEY (subject_identifier),
    -- academic_level is a constrained catalog value (mirrors the AcademicLevel enum)
    CONSTRAINT chk_subjects_academic_level CHECK (
        academic_level IN ('PRIMARY', 'SECONDARY', 'HIGH_SCHOOL', 'UNIVERSITY', 'POSTGRADUATE')
    )
);

-- A subject name may repeat across academic levels (e.g. "Matemáticas" at both
-- High School and University), but must be unique within a single level —
-- case-insensitively, so "Física" and "física" collide.
CREATE UNIQUE INDEX uq_subjects_name_level ON subjects (LOWER(subject_name), academic_level);

-- Most listings filter by active records, so index that predicate.
CREATE INDEX idx_subjects_is_active_record ON subjects (is_active_record);
