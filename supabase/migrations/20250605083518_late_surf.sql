/*
  # Add Default Images for Mentors

  1. Changes
    - Creates a function to add default images for each mentor
    - Adds three professional stock photos for each mentor
    - Only adds images if mentor doesn't have any

  2. Implementation
    - Uses high-quality Pexels stock photos
    - Adds meaningful captions
    - Maintains data consistency
*/

-- Function to add default images for mentors
CREATE OR REPLACE FUNCTION add_default_mentor_images()
RETURNS void AS $$
DECLARE
    mentor_record RECORD;
BEGIN
    -- Loop through all mentors
    FOR mentor_record IN SELECT id FROM professionals
    LOOP
        -- Only add default images if mentor doesn't have any
        IF NOT EXISTS (
            SELECT 1 FROM mentor_media 
            WHERE mentor_id = mentor_record.id
        ) THEN
            -- Insert three default images for each mentor
            INSERT INTO mentor_media (mentor_id, media_url, caption)
            VALUES
            (
                mentor_record.id,
                'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
                'Professional Development Session'
            ),
            (
                mentor_record.id,
                'https://images.pexels.com/photos/3184603/pexels-photo-3184603.jpeg',
                'Team Leadership Workshop'
            ),
            (
                mentor_record.id,
                'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg',
                'One-on-One Mentoring'
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT add_default_mentor_images();

-- Drop the function after use
DROP FUNCTION add_default_mentor_images();