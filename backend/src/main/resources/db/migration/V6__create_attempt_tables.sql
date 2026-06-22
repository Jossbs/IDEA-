-- ───────────────────────────────────────────────────────────
-- V6 — exam attempts & answers
-- A student submits one attempt per exam (enforced by a unique index). The
-- attempt stores the auto-graded score immediately; manual_score is filled in
-- later when a teacher reviews short-text answers. Answers cascade-delete with
-- their attempt. Follows the system conventions (UUID PK, soft-delete, audit).
-- ───────────────────────────────────────────────────────────
CREATE TABLE exam_attempts (
    attempt_id         UUID        NOT NULL DEFAULT gen_random_uuid(),
    exam_id            UUID        NOT NULL,
    student_id         UUID        NOT NULL,
    status             VARCHAR(20) NOT NULL,
    auto_score         INTEGER     NOT NULL DEFAULT 0,
    manual_score       INTEGER,
    max_score          INTEGER     NOT NULL,
    started_at         TIMESTAMP,
    submitted_at       TIMESTAMP   NOT NULL,
    is_active_record   BOOLEAN     NOT NULL DEFAULT TRUE,
    creation_timestamp TIMESTAMP   NOT NULL DEFAULT NOW(),
    update_timestamp   TIMESTAMP   NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_exam_attempts PRIMARY KEY (attempt_id),
    CONSTRAINT fk_attempt_exam FOREIGN KEY (exam_id) REFERENCES exams (exam_id),
    CONSTRAINT fk_attempt_student FOREIGN KEY (student_id) REFERENCES users (user_id),
    CONSTRAINT chk_attempt_status CHECK (status IN ('GRADED', 'PENDING_REVIEW'))
);

-- Single attempt per (exam, student).
CREATE UNIQUE INDEX uq_attempt_exam_student ON exam_attempts (exam_id, student_id);
CREATE INDEX idx_attempts_exam_id ON exam_attempts (exam_id);

CREATE TABLE attempt_answers (
    answer_id          UUID      NOT NULL DEFAULT gen_random_uuid(),
    attempt_id         UUID      NOT NULL,
    question_id        UUID      NOT NULL,
    selected_option_id UUID,
    answer_text        TEXT,
    is_active_record   BOOLEAN   NOT NULL DEFAULT TRUE,
    creation_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    update_timestamp   TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_attempt_answers PRIMARY KEY (answer_id),
    CONSTRAINT fk_answer_attempt FOREIGN KEY (attempt_id)
        REFERENCES exam_attempts (attempt_id) ON DELETE CASCADE,
    CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES questions (question_id)
);

CREATE INDEX idx_attempt_answers_attempt_id ON attempt_answers (attempt_id);
