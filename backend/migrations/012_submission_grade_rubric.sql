ALTER TABLE submission_grades ADD COLUMN rubric jsonb
    CHECK (rubric IS NULL OR (
        jsonb_typeof(rubric) = 'array' AND jsonb_array_length(rubric) BETWEEN 1 AND 12
    ));
