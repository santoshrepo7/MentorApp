/*
  # Add notifications table for appointment updates

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `appointment_id` (uuid, references appointments)
      - `type` (text) - Type of notification (e.g., 'appointment_update')
      - `title` (text) - Notification title
      - `message` (text) - Notification message
      - `status` (text) - Status of notification ('read' or 'unread')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on notifications table
    - Add policies for authenticated users
*/

-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'unread',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT valid_notification_type CHECK (type IN ('appointment_update', 'appointment_reminder', 'appointment_cancelled')),
  CONSTRAINT valid_notification_status CHECK (status IN ('read', 'unread'))
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = notifications.appointment_id
      AND (appointments.user_id = auth.uid() OR appointments.mentor_id = auth.uid())
    )
  );

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_notifications_appointment_id ON notifications(appointment_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Add trigger to update updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();