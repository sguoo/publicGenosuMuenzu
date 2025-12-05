-- Create booths table
CREATE TABLE IF NOT EXISTS booths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  character TEXT NOT NULL,
  products TEXT,
  image TEXT,
  cover_image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table (foreign key to booths)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booth_id UUID NOT NULL REFERENCES booths(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  price TEXT,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create authentication_codes table (used 필드 제거)
CREATE TABLE IF NOT EXISTS authentication_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for security
ALTER TABLE booths ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE authentication_codes ENABLE ROW LEVEL SECURITY;

-- Create public policies
CREATE POLICY "booths_read_all" ON booths FOR SELECT USING (true);
CREATE POLICY "booths_insert_all" ON booths FOR INSERT WITH CHECK (true);

CREATE POLICY "products_read_all" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert_all" ON products FOR INSERT WITH CHECK (true);

CREATE POLICY "auth_codes_insert_all" ON authentication_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "auth_codes_select_all" ON authentication_codes FOR SELECT USING (true);
