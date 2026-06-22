-- ───────────────────────────────────────────────────────────
-- V5 — exam ownership
-- Each exam belongs to the teacher who authored it, so "Mis Evaluaciones"
-- can be scoped per teacher. Nullable for now (pre-auth rows predate this);
-- the service always populates it from the authenticated principal on create.
-- ───────────────────────────────────────────────────────────
ALTER TABLE exams
    ADD COLUMN teacher_id UUID;

ALTER TABLE exams
    ADD CONSTRAINT fk_exams_teacher FOREIGN KEY (teacher_id)
        REFERENCES users (user_id);

CREATE INDEX idx_exams_teacher_id ON exams (teacher_id);
