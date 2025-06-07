/*
  # Create Mentor Media Table and Add Default Images

  1. New Tables
    - `mentor_media`
      - `id` (uuid, primary key)
      - `mentor_id` (uuid, references professionals)
      - `media_url` (text)
      - `caption` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on mentor_media table
    - Add policies for mentors to manage their media
    - Allow public viewing of media

  3. Data Population
    - Add default professional images for each mentor
    - Images showcase mentoring and professional development
*/

-- Create mentor_media table if it doesn't exist
CREATE TABLE IF NOT EXISTS mentor_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  caption text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE mentor_media ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Mentors can manage their own media" ON mentor_media;
DROP POLICY IF EXISTS "Everyone can view mentor media" ON mentor_media;

-- Create policies
CREATE POLICY "Mentors can manage their own media"
  ON mentor_media
  FOR ALL
  TO authenticated
  USING (mentor_id = auth.uid())
  WITH CHECK (mentor_id = auth.uid());

CREATE POLICY "Everyone can view mentor media"
  ON mentor_media
  FOR SELECT
  TO public
  USING (true);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_mentor_media_updated_at ON mentor_media;

-- Add trigger for updated_at
CREATE TRIGGER update_mentor_media_updated_at
  BEFORE UPDATE ON mentor_media
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to add default images for mentors
CREATE OR REPLACE FUNCTION add_default_mentor_images()
RETURNS void AS $$
DECLARE
    mentor_record RECORD;
    image_urls text[] := ARRAY[
        'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
        'https://images.pexels.com/photos/3184603/pexels-photo-3184603.jpeg',
        'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg',
        'https://images.pexels.com/photos/7516363/pexels-photo-7516363.jpeg',
        'https://images.pexels.com/photos/7516339/pexels-photo-7516339.jpeg',
        'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg'
    ];
    captions text[] := ARRAY[
        'Professional Development Session',
        'Team Leadership Workshop',
        'One-on-One Mentoring',
        'Strategic Planning Meeting',
        'Skills Development Training',
        'Career Guidance Session'
    ];
    i integer;
BEGIN
    -- Loop through all mentors
    FOR mentor_record IN SELECT id FROM professionals
    LOOP
        -- Only add default images if mentor doesn't have any
        IF NOT EXISTS (
            SELECT 1 FROM mentor_media 
            WHERE mentor_id = mentor_record.id
        ) THEN
            -- Insert three random images for each mentor
            FOR i IN 1..3 LOOP
                INSERT INTO mentor_media (mentor_id, media_url, caption)
                VALUES (
                    mentor_record.id,
                    image_urls[((mentor_record.id::text || i::text)::uuid % array_length(image_urls, 1)) + 1],
                    captions[((mentor_record.id::text || i::text)::uuid % array_length(captions, 1)) + 1]
                );
            END LOOP;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to add default images
SELECT add_default_mentor_images();

-- Drop the function after use
DROP FUNCTION add_default_mentor_images();