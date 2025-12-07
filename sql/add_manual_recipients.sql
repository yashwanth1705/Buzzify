-- Add manual_recipients column to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS manual_recipients TEXT[] DEFAULT '{}';
