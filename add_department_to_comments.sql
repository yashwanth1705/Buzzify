-- Add user_department column to comments table
ALTER TABLE comments ADD COLUMN IF NOT EXISTS user_department VARCHAR(255);
