/*
  # Add Mentor Media Gallery

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
    - Add policies for media management
*/

-- Create mentor_media table
CREATE TABLE mentor_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  caption text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE mentor_media ENABLE ROW LEVEL SECURITY;

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

-- Add trigger for updated_at
CREATE TRIGGER update_mentor_media_updated_at
  BEFORE UPDATE ON mentor_media
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();