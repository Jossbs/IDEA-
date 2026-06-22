-- ───────────────────────────────────────────────────────────
-- V2 — exam authoring: exams · questions · question_options
-- Exams reference a subject; questions belong to an exam; options belong to a
-- question. Children cascade-delete with their parent. Follows the system
-- conventions (UUID PKs, snake_case, soft-delete, audit timestamps).
-- ───────────────────────────────────────────────────────────
CREATE TABLE exams (
    exam_id            UUID         NOT NULL DEFAULT gen_random_uuid(),
    subject_id         UUID         NOT NULL,
    title              VARCHAR(150) NOT NULL,
    description        TEXT,
    is_published       BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active_record   BOOLEAN      NOT NULL DEFAULT TRUE,
    creation_timestamp TIMESTAMP    NOT NULL DEFAULT NOW(),
    update_timestamp   TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_exams PRIMARY KEY (exam_id),
    CONSTRAINT fk_exams_subject FOREIGN KEY (subject_id)
        REFERENCES subjects (subject_identifier)
);

CREATE INDEX idx_exams_subject_id ON exams (subject_id);

CREATE TABLE questions (
    question_id        UUID         NOT NULL DEFAULT gen_random_uuid(),
    exam_id            UUID         NOT NULL,
    question_text      TEXT         NOT NULL,
    question_type      VARCHAR(30)  NOT NULL,
    points             INTEGER      NOT NULL DEFAULT 1,
    sort_order         INTEGER      NOT NULL DEFAULT 0,
    is_active_record   BOOLEAN      NOT NULL DEFAULT TRUE,
    creation_timestamp TIMESTAMP    NOT NULL DEFAULT NOW(),
    update_timestamp   TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_questions PRIMARY KEY (question_id),
    CONSTRAINT fk_questions_exam FOREIGN KEY (exam_id)
        REFERENCES exams (exam_id) ON DELETE CASCADE,
    -- mirrors the QuestionType enum
    CONSTRAINT chk_questions_type CHECK (
        question_type IN ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_TEXT')
    ),
    CONSTRAINT chk_questions_points CHECK (points >= 1)
);

CREATE INDEX idx_questions_exam_id ON questions (exam_id);

CREATE TABLE question_options (
    option_id          UUID         NOT NULL DEFAULT gen_random_uuid(),
    question_id        UUID         NOT NULL,
    option_text        TEXT         NOT NULL,
    is_correct         BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active_record   BOOLEAN      NOT NULL DEFAULT TRUE,
    creation_timestamp TIMESTAMP    NOT NULL DEFAULT NOW(),
    update_timestamp   TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_question_options PRIMARY KEY (option_id),
    CONSTRAINT fk_options_question FOREIGN KEY (question_id)
        REFERENCES questions (question_id) ON DELETE CASCADE
);

CREATE INDEX idx_question_options_question_id ON question_options (question_id);
