/*
  # Add Mentor Availability Preferences

  1. New Tables
    - `mentor_availability`
      - `id` (uuid, primary key)
      - `mentor_id` (uuid, references professionals)
      - `day_of_week` (integer, 0-6 where 0 is Sunday)
      - `start_time` (time)
      - `end_time` (time)
      - `is_available` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on mentor_availability table
    - Add policies for mentors to manage their availability
*/

-- Create mentor_availability table
CREATE TABLE mentor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Ensure end_time is after start_time
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Enable RLS
ALTER TABLE mentor_availability ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Mentors can manage their own availability"
  ON mentor_availability
  FOR ALL
  TO authenticated
  USING (mentor_id = auth.uid())
  WITH CHECK (mentor_id = auth.uid());

CREATE POLICY "Everyone can view mentor availability"
  ON mentor_availability
  FOR SELECT
  TO public
  USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_mentor_availability_mentor ON mentor_availability(mentor_id);
CREATE INDEX idx_mentor_availability_day ON mentor_availability(day_of_week);

-- Add trigger for updated_at
CREATE TRIGGER update_mentor_availability_updated_at
  BEFORE UPDATE ON mentor_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();