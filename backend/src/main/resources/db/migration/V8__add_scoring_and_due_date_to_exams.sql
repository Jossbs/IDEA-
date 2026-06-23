-- Adds explicit exam scoring (declared total + accreditation threshold) and a
-- delivery deadline. Existing exams are backfilled from their questions so the
-- new NOT NULL columns and CHECK constraints hold for legacy data.

ALTER TABLE exams ADD COLUMN total_points  INTEGER;
ALTER TABLE exams ADD COLUMN passing_score INTEGER;
ALTER TABLE exams ADD COLUMN due_at        TIMESTAMP;

-- Backfill total_points from the sum of each exam's active question points.
UPDATE exams e
SET total_points = COALESCE((
    SELECT SUM(q.points)
    FROM questions q
    WHERE q.exam_id = e.exam_id AND q.is_active_record = TRUE), 0);

-- Guard: every exam must be worth at least 1 point.
UPDATE exams SET total_points = 1 WHERE total_points < 1;

-- Default accreditation threshold = 60% of the total (at least 1 point).
UPDATE exams SET passing_score = GREATEST(1, CEIL(total_points * 0.6));

ALTER TABLE exams ALTER COLUMN total_points  SET NOT NULL;
ALTER TABLE exams ALTER COLUMN passing_score SET NOT NULL;

ALTER TABLE exams
    ADD CONSTRAINT chk_exams_total_points CHECK (total_points >= 1);
ALTER TABLE exams
    ADD CONSTRAINT chk_exams_passing_score CHECK (passing_score >= 1 AND passing_score <= total_points);
