/*
  # Update appointments table RLS policies

  1. Changes
    - Add new RLS policy for appointment creation
    - Modify existing policies for better security

  2. Security
    - Enable RLS on appointments table (if not already enabled)
    - Add policy for authenticated users to create appointments
    - Maintain existing policies for reading and updating
*/

-- First ensure RLS is enabled
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Users can create own appointments" ON appointments;

-- Create new insert policy with proper checks
CREATE POLICY "Users can create appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if user is either the appointment user or the mentor
    auth.uid() = user_id OR auth.uid() = mentor_id
  );

-- Ensure the existing select policy is correct
DROP POLICY IF EXISTS "Users can read own appointments" ON appointments;
CREATE POLICY "Users can read own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() = mentor_id
  );

-- Ensure the existing update policy is correct
DROP POLICY IF EXISTS "Mentors can update appointments" ON appointments;
CREATE POLICY "Users can update own appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() = mentor_id
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    auth.uid() = mentor_id
  );