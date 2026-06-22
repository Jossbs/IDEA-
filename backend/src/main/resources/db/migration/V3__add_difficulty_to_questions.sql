-- ───────────────────────────────────────────────────────────
-- V3 — question difficulty
-- Adds difficulty_level to questions. Distinct from question_type/points:
-- type drives grading, points its weight, difficulty is analytics / future
-- question-bank filtering. DEFAULT 'MEDIUM' keeps any existing rows valid and
-- matches the authoring UI default. Mirrors the DifficultyLevel enum.
-- ───────────────────────────────────────────────────────────
ALTER TABLE questions
    ADD COLUMN difficulty_level VARCHAR(10) NOT NULL DEFAULT 'MEDIUM';

ALTER TABLE questions
    ADD CONSTRAINT chk_questions_difficulty CHECK (
        difficulty_level IN ('LOW', 'MEDIUM', 'HIGH')
    );
