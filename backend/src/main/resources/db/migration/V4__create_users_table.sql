-- ───────────────────────────────────────────────────────────
-- V4 — users (identity & roles)
-- Backs JWT authentication. Two roles for the MVP: TEACHER authors/grades,
-- STUDENT takes exams. Follows the system conventions (UUID PK, snake_case,
-- soft-delete, audit timestamps). Email is unique case-insensitively.
-- ───────────────────────────────────────────────────────────
CREATE TABLE users (
    user_id            UUID         NOT NULL DEFAULT gen_random_uuid(),
    email              VARCHAR(255) NOT NULL,
    password_hash      VARCHAR(100) NOT NULL,
    full_name          VARCHAR(150) NOT NULL,
    role               VARCHAR(20)  NOT NULL,
    is_active_record   BOOLEAN      NOT NULL DEFAULT TRUE,
    creation_timestamp TIMESTAMP    NOT NULL DEFAULT NOW(),
    update_timestamp   TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_users PRIMARY KEY (user_id),
    CONSTRAINT chk_users_role CHECK (role IN ('TEACHER', 'STUDENT'))
);

-- Login is by email; uniqueness is case-insensitive ("Ana@x.com" == "ana@x.com").
CREATE UNIQUE INDEX uq_users_email ON users (LOWER(email));
