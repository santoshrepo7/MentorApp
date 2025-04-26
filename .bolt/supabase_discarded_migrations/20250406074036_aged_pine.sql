/*
  # Create categories table

  1. New Tables
    - `categories`
      - `id` (integer, primary key)
      - `name` (text, not null)
      - `description` (text, not null)
      - `image_url` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `categories` table
    - Add policy for public read access to categories
    - Add policy for authenticated users to manage categories (admin functionality)

  3. Sample Data
    - Insert initial categories for testing
*/

-- Create the categories table
CREATE TABLE IF NOT EXISTS categories (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only authenticated users can manage categories"
  ON categories
  USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO categories (name, description, image_url) VALUES
  (
    'Career Development',
    'Get guidance on career growth, job transitions, and professional development',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1000&q=80'
  ),
  (
    'Technology',
    'Learn programming, software development, and cutting-edge tech skills',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80'
  ),
  (
    'Business & Entrepreneurship',
    'Start and grow your business with expert guidance and strategic advice',
    'https://images.unsplash.com/photo-1664575602554-2087b04935a5?auto=format&fit=crop&w=1000&q=80'
  ),
  (
    'Leadership',
    'Develop leadership skills and learn effective team management strategies',
    'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=1000&q=80'
  );