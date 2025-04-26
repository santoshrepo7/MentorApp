/*
  # Add online status tracking for professionals

  1. Changes
    - Add last_seen column to professionals table
    - Add online_status column to professionals table
    - Add function to update online status automatically
    - Add trigger to update online status on last_seen changes

  2. Security
    - Maintain existing RLS policies
    - Allow authenticated users to update their own online status
*/

-- Add last_seen column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'professionals' AND column_name = 'last_seen'
  ) THEN
    ALTER TABLE professionals
    ADD COLUMN last_seen timestamptz DEFAULT now();
  END IF;
END $$;

-- Add online_status column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'professionals' AND column_name = 'online_status'
  ) THEN
    ALTER TABLE professionals
    ADD COLUMN online_status boolean DEFAULT false;
  END IF;
END $$;

-- Create function to update online status
CREATE OR REPLACE FUNCTION update_online_status()
RETURNS trigger AS $$
BEGIN
  -- Consider user online if last seen within last 5 minutes
  NEW.online_status := (NEW.last_seen >= (now() - interval '5 minutes'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update online status
DROP TRIGGER IF EXISTS update_online_status_trigger ON professionals;
CREATE TRIGGER update_online_status_trigger
  BEFORE INSERT OR UPDATE OF last_seen
  ON professionals
  FOR EACH ROW
  EXECUTE FUNCTION update_online_status();

-- Add policy for updating last_seen
CREATE POLICY "Users can update their own last_seen"
  ON professionals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);