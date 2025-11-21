-- This file contains the SQL to set up Supabase tables
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'student')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  phone_number TEXT,
  department TEXT,
  course TEXT,
  sub_course TEXT,
  dob TEXT,
  age INTEGER,
  blood_group TEXT,
  parent_phone TEXT,
  responsible_staff TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sender TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  recipients TEXT NOT NULL,
  custom_groups INTEGER[] DEFAULT '{}',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT,
  attachments TEXT[] DEFAULT '{}',
  schedule_type TEXT NOT NULL DEFAULT 'now' CHECK (schedule_type IN ('now', 'later')),
  schedule_date TEXT,
  schedule_time TEXT,
  total_recipients INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS groups (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  department TEXT,
  created_by TEXT NOT NULL,
  members TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  head_of_department TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS (Row Level Security) for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (you can make this more restrictive later)
-- Drop existing policies first to make the script idempotent
DROP POLICY IF EXISTS "Allow public read on users" ON users;
DROP POLICY IF EXISTS "Allow public insert on users" ON users;
DROP POLICY IF EXISTS "Allow public update on users" ON users;
DROP POLICY IF EXISTS "Allow public delete on users" ON users;

DROP POLICY IF EXISTS "Allow public read on messages" ON messages;
DROP POLICY IF EXISTS "Allow public insert on messages" ON messages;
DROP POLICY IF EXISTS "Allow public update on messages" ON messages;
DROP POLICY IF EXISTS "Allow public delete on messages" ON messages;

DROP POLICY IF EXISTS "Allow public read on groups" ON groups;
DROP POLICY IF EXISTS "Allow public insert on groups" ON groups;
DROP POLICY IF EXISTS "Allow public update on groups" ON groups;
DROP POLICY IF EXISTS "Allow public delete on groups" ON groups;

DROP POLICY IF EXISTS "Allow public read on departments" ON departments;
DROP POLICY IF EXISTS "Allow public insert on departments" ON departments;
DROP POLICY IF EXISTS "Allow public update on departments" ON departments;
DROP POLICY IF EXISTS "Allow public delete on departments" ON departments;

DROP POLICY IF EXISTS "Allow public read on notifications" ON notifications;
DROP POLICY IF EXISTS "Allow public insert on notifications" ON notifications;
DROP POLICY IF EXISTS "Allow public update on notifications" ON notifications;

-- Now create the policies
CREATE POLICY "Allow public read on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert on users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on users" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on users" ON users FOR DELETE USING (true);

CREATE POLICY "Allow public read on messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert on messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on messages" ON messages FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on messages" ON messages FOR DELETE USING (true);

CREATE POLICY "Allow public read on groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Allow public insert on groups" ON groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on groups" ON groups FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on groups" ON groups FOR DELETE USING (true);

CREATE POLICY "Allow public read on departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on departments" ON departments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on departments" ON departments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on departments" ON departments FOR DELETE USING (true);

CREATE POLICY "Allow public read on notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow public insert on notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on notifications" ON notifications FOR UPDATE USING (true);
