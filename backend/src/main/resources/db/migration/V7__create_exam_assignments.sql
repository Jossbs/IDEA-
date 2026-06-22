-- ───────────────────────────────────────────────────────────
-- V7 — exam assignments (which students an exam is directed to)
-- Many-to-many between exams and student users. A student only sees a published
-- exam if it is assigned to them. Assignments cascade-delete with their exam.
-- Follows the system conventions (UUID PK, soft-delete, audit timestamps).
-- ───────────────────────────────────────────────────────────
CREATE TABLE exam_assignments (
    assignment_id      UUID      NOT NULL DEFAULT gen_random_uuid(),
    exam_id            UUID      NOT NULL,
    student_id         UUID      NOT NULL,
    is_active_record   BOOLEAN   NOT NULL DEFAULT TRUE,
    creation_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    update_timestamp   TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_exam_assignments PRIMARY KEY (assignment_id),
    CONSTRAINT fk_assignment_exam FOREIGN KEY (exam_id)
        REFERENCES exams (exam_id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_student FOREIGN KEY (student_id) REFERENCES users (user_id),
    CONSTRAINT uq_assignment_exam_student UNIQUE (exam_id, student_id)
);

CREATE INDEX idx_assignments_exam_id ON exam_assignments (exam_id);
CREATE INDEX idx_assignments_student_id ON exam_assignments (student_id);
