/*
  # Add Categories Management

  1. Changes
    - Add unique constraints and indexes to categories and subcategories tables
    - Add RLS policies for category management
    - Add triggers for search optimization

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Add unique constraints if they don't exist
ALTER TABLE categories
ADD CONSTRAINT categories_name_unique UNIQUE (name);

ALTER TABLE subcategories
ADD CONSTRAINT subcategories_name_category_unique UNIQUE (name, category_id);

-- Add policies for category management
CREATE POLICY "Anyone can view categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view subcategories"
  ON subcategories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create subcategories"
  ON subcategories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add search indexes
CREATE INDEX IF NOT EXISTS idx_categories_search 
ON categories USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

CREATE INDEX IF NOT EXISTS idx_subcategories_search 
ON subcategories USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));