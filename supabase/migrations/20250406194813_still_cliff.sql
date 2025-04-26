/*
  # Add Ratings and Reviews

  1. New Tables
    - `reviews`
      - `id` (uuid, primary key)
      - `appointment_id` (uuid, references appointments)
      - `user_id` (uuid, references profiles)
      - `mentor_id` (uuid, references professionals)
      - `rating` (integer, 1-5)
      - `review` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes
    - Add trigger to update mentor's average rating when a review is added/updated

  3. Security
    - Enable RLS on reviews table
    - Add policies for review management
*/

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(appointment_id)
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create reviews for their appointments"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = appointment_id
      AND appointments.user_id = auth.uid()
      AND appointments.status = 'confirmed'
    )
  );

CREATE POLICY "Users can view reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create function to update mentor's rating
CREATE OR REPLACE FUNCTION update_mentor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE professionals
  SET rating = (
    SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
    FROM reviews
    WHERE mentor_id = NEW.mentor_id
  )
  WHERE id = NEW.mentor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rating updates
CREATE TRIGGER update_mentor_rating_trigger
AFTER INSERT OR UPDATE OF rating
ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_mentor_rating();

-- Add updated_at trigger
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();