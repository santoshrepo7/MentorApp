/*
  # Add search index and constraints for appointments

  1. Changes
    - Add text search index for problem descriptions if not exists
    - Add constraint to ensure non-empty problem descriptions if not exists

  2. Implementation Details
    - Skip column creation since it already exists
    - Create index for full-text search if not exists
    - Add constraint to ensure quality of entries if not exists
*/

-- Add index for searching through problem descriptions if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_appointments_problem_description'
  ) THEN
    CREATE INDEX idx_appointments_problem_description 
    ON appointments 
    USING gin(to_tsvector('english', coalesce(problem_description, '')));
  END IF;
END $$;

-- Add constraint to ensure new appointments have a problem description if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'appointments_problem_description_not_empty'
  ) THEN
    ALTER TABLE appointments
    ADD CONSTRAINT appointments_problem_description_not_empty 
    CHECK (problem_description IS NULL OR length(trim(problem_description)) > 0);
  END IF;
END $$;