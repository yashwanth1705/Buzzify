-- FIX_SCHEMA.sql
-- Run this in the Supabase SQL Editor to ensure the messages table has the correct columns.

-- 1. Ensure 'acknowledged_by' column exists
ALTER TABLE messages ADD COLUMN IF NOT EXISTS acknowledged_by INTEGER[] DEFAULT '{}';

-- 2. Ensure 'acknowledged' column exists (optional, but good for consistency)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS acknowledged BOOLEAN DEFAULT false;

-- 3. Ensure 'acknowledgements' table exists
CREATE TABLE IF NOT EXISTS acknowledgements (
  id BIGSERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  user_name TEXT,
  user_email TEXT,
  user_role TEXT,
  acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Refresh RLS policies to ensure updates are allowed
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policy to avoid conflicts
DROP POLICY IF EXISTS "Allow public update on messages" ON messages;

-- Re-create the update policy
CREATE POLICY "Allow public update on messages" ON messages FOR UPDATE USING (true);

-- Grant permissions (if needed, though public policies usually suffice for anon/authenticated)
GRANT ALL ON messages TO postgres;
GRANT ALL ON messages TO anon;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON acknowledgements TO postgres;
GRANT ALL ON acknowledgements TO anon;
GRANT ALL ON acknowledgements TO authenticated;
