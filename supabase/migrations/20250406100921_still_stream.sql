/*
  # Add profiles for mentors

  1. Changes
    - Creates profiles for any mentors that don't have them
    - Sets up auth.users entries with default password
    - Links profiles with professionals table

  2. Security
    - Uses secure password hashing
    - Maintains existing RLS policies
*/

-- Function to create missing profiles and auth entries
CREATE OR REPLACE FUNCTION create_missing_mentor_profiles()
RETURNS void AS $$
DECLARE
    mentor_record RECORD;
    user_id uuid;
BEGIN
    -- Loop through professionals without profiles
    FOR mentor_record IN 
        SELECT p.id, p.position as full_name 
        FROM professionals p 
        LEFT JOIN profiles pr ON p.id = pr.id 
        WHERE pr.id IS NULL
    LOOP
        -- Create auth.users entry with default password (123456)
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
        VALUES (
            mentor_record.id,
            concat('mentor_', mentor_record.id, '@example.com'),
            crypt('123456', gen_salt('bf')),
            now()
        );

        -- Create profile entry
        INSERT INTO profiles (id, full_name, created_at, updated_at)
        VALUES (
            mentor_record.id,
            mentor_record.full_name,
            now(),
            now()
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_missing_mentor_profiles();

-- Drop the function after use
DROP FUNCTION create_missing_mentor_profiles();