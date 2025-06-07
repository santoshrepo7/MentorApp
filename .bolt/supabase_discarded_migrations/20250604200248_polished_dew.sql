/*
  # Stale Appointments Management

  1. New Tables
    - `stale_appointments`: Stores historical appointment data
      - Inherits structure from appointments table
      - Additional fields for tracking when appointment was archived

  2. Functions
    - `move_to_stale_appointments()`: Moves completed/cancelled appointments older than current date
    - `cleanup_old_appointments()`: Removes appointments from main table after moving them

  3. Triggers
    - Automatic cleanup trigger that runs daily
*/

-- Create stale appointments table
CREATE TABLE IF NOT EXISTS stale_appointments (
  id uuid PRIMARY KEY,
  mentor_id uuid NOT NULL,
  user_id uuid NOT NULL,
  date date NOT NULL,
  time time without time zone NOT NULL,
  status text NOT NULL,
  type text NOT NULL,
  payment_status text NOT NULL,
  payment_amount numeric(10,2),
  payment_method text,
  payment_intent_id text,
  problem_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  archived_at timestamptz DEFAULT now(),
  FOREIGN KEY (mentor_id) REFERENCES professionals(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT valid_status CHECK (status = ANY (ARRAY['confirmed'::text, 'cancelled'::text, 'postponed'::text])),
  CONSTRAINT valid_type CHECK (type = ANY (ARRAY['video'::text, 'chat'::text, 'call'::text])),
  CONSTRAINT valid_payment_status CHECK (payment_status = ANY (ARRAY['pending'::text, 'completed'::text, 'refunded'::text])),
  CONSTRAINT valid_payment_method CHECK (payment_method = ANY (ARRAY['card'::text, 'qr'::text, 'paypal'::text]))
);

-- Enable RLS on stale_appointments
ALTER TABLE stale_appointments ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for stale_appointments
CREATE POLICY "Users can view their own stale appointments" ON stale_appointments
  FOR SELECT TO authenticated
  USING ((auth.uid() = user_id) OR (auth.uid() = mentor_id));

-- Function to move appointments to stale table
CREATE OR REPLACE FUNCTION move_to_stale_appointments()
RETURNS void AS $$
BEGIN
  -- Insert old appointments into stale_appointments
  INSERT INTO stale_appointments (
    id, mentor_id, user_id, date, time, status, type,
    payment_status, payment_amount, payment_method, payment_intent_id,
    problem_description, created_at, updated_at
  )
  SELECT 
    id, mentor_id, user_id, date, time, status, type,
    payment_status, payment_amount, payment_method, payment_intent_id,
    problem_description, created_at, updated_at
  FROM appointments
  WHERE 
    date < CURRENT_DATE
    AND status IN ('confirmed', 'cancelled')
    AND id NOT IN (SELECT id FROM stale_appointments);

  -- Delete moved appointments from main table
  DELETE FROM appointments
  WHERE 
    date < CURRENT_DATE
    AND status IN ('confirmed', 'cancelled')
    AND id IN (SELECT id FROM stale_appointments);
END;
$$ LANGUAGE plpgsql;

-- Create a function to run the cleanup daily
CREATE OR REPLACE FUNCTION cleanup_old_appointments()
RETURNS void AS $$
BEGIN
  PERFORM move_to_stale_appointments();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled trigger (runs daily at midnight)
SELECT cron.schedule(
  'cleanup-old-appointments',
  '0 0 * * *',
  'SELECT cleanup_old_appointments()'
);