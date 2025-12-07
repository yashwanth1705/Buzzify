-- COMPLETE_SETUP.sql
-- This is the MASTER SQL script for the Campus Messaging Portal.
-- It combines all previous schema files into one single source of truth.
-- Run this in your Supabase SQL Editor to set up the entire database.

-- ==========================================
-- 1. EXTENSIONS & CONFIGURATION
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. TABLES
-- ==========================================

-- 2.1 USERS
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
  dob DATE,
  age INTEGER,
  blood_group TEXT,
  parent_phone TEXT,
  responsible_staff TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  head_of_department TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.3 COURSES (Linked to Departments)
CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50), -- e.g., "BE", "BTECH"
  description TEXT,
  department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT courses_department_name_unique UNIQUE(department_id, name)
);

-- 2.4 SUB-COURSES (Linked to Courses)
CREATE TABLE IF NOT EXISTS sub_courses (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50), -- e.g., "CSE", "MECH"
  description TEXT,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT sub_courses_course_name_unique UNIQUE(course_id, name)
);

-- 2.5 GROUPS
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

-- 2.6 MESSAGES
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
  schedule_date DATE,
  schedule_time TIME,
  total_recipients INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.7 NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.8 ACKNOWLEDGEMENTS (Detailed tracking)
CREATE TABLE IF NOT EXISTS acknowledgements (
  id BIGSERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  user_name TEXT,
  user_email TEXT,
  user_role TEXT,
  acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);
CREATE INDEX IF NOT EXISTS idx_courses_department_id ON courses(department_id);
CREATE INDEX IF NOT EXISTS idx_sub_courses_course_id ON sub_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ==========================================
-- 4. TRIGGERS (Auto-update updated_at)
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
  CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_sub_courses_updated_at BEFORE UPDATE ON sub_courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE acknowledgements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean slate
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on departments" ON departments;
DROP POLICY IF EXISTS "Allow all operations on courses" ON courses;
DROP POLICY IF EXISTS "Allow all operations on sub_courses" ON sub_courses;
DROP POLICY IF EXISTS "Allow all operations on groups" ON groups;
DROP POLICY IF EXISTS "Allow all operations on messages" ON messages;
DROP POLICY IF EXISTS "Allow all operations on notifications" ON notifications;
DROP POLICY IF EXISTS "Allow all operations on acknowledgements" ON acknowledgements;

-- Create permissive policies (Update these for production!)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on departments" ON departments FOR ALL USING (true);
CREATE POLICY "Allow all operations on courses" ON courses FOR ALL USING (true);
CREATE POLICY "Allow all operations on sub_courses" ON sub_courses FOR ALL USING (true);
CREATE POLICY "Allow all operations on groups" ON groups FOR ALL USING (true);
CREATE POLICY "Allow all operations on messages" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on notifications" ON notifications FOR ALL USING (true);
CREATE POLICY "Allow all operations on acknowledgements" ON acknowledgements FOR ALL USING (true);

-- ==========================================
-- 6. DEMO DATA
-- ==========================================

-- Departments
INSERT INTO departments (name, description, head_of_department, created_by) VALUES
('Computer Science', 'Department of Computer Science and Engineering', 'Dr. Smith', 'admin@college.edu'),
('Electronics', 'Department of Electronics and Communication', 'Dr. Johnson', 'admin@college.edu'),
('Mechanical Engineering', 'Department of Mechanical Engineering', 'Dr. Brown', 'admin@college.edu'),
('Civil Engineering', 'Department of Civil Engineering', 'Dr. Davis', 'admin@college.edu'),
('Administration', 'Administrative Department', 'Principal', 'admin@college.edu')
ON CONFLICT (name) DO NOTHING;

-- Courses (Linked to Departments)
INSERT INTO courses (name, code, description, department_id, created_by) VALUES
('Bachelor of Engineering', 'BE', 'Bachelor of Engineering program', (SELECT id FROM departments WHERE name = 'Computer Science' LIMIT 1), 'admin@college.edu'),
('Bachelor of Technology', 'BTECH', 'Bachelor of Technology program', (SELECT id FROM departments WHERE name = 'Computer Science' LIMIT 1), 'admin@college.edu'),
('Master of Engineering', 'ME', 'Master of Engineering program', (SELECT id FROM departments WHERE name = 'Computer Science' LIMIT 1), 'admin@college.edu')
ON CONFLICT (department_id, name) DO NOTHING;

-- Sub-Courses (Linked to Courses)
INSERT INTO sub_courses (name, code, description, course_id, created_by) VALUES
('Computer Science and Engineering', 'CSE', 'Computer Science and Engineering specialization', (SELECT id FROM courses WHERE name = 'Bachelor of Engineering' AND code = 'BE' LIMIT 1), 'admin@college.edu'),
('Mechanical Engineering', 'MECH', 'Mechanical Engineering specialization', (SELECT id FROM courses WHERE name = 'Bachelor of Engineering' AND code = 'BE' LIMIT 1), 'admin@college.edu'),
('Civil Engineering', 'CIVIL', 'Civil Engineering specialization', (SELECT id FROM courses WHERE name = 'Bachelor of Engineering' AND code = 'BE' LIMIT 1), 'admin@college.edu')
ON CONFLICT (course_id, name) DO NOTHING;

-- Users
INSERT INTO users (name, email, role, password, status, department, phone_number, dob, age, blood_group) VALUES
('Admin User', 'admin@college.edu', 'admin', 'admin123', 'active', 'Administration', '1234567890', '1985-01-15', 39, 'O+'),
('Staff Member', 'staff@college.edu', 'staff', 'staff123', 'active', 'Computer Science', '0987654321', '1990-05-20', 34, 'A+'),
('John Student', 'student@college.edu', 'student', 'student123', 'active', 'Computer Science', '1122334455', '2003-08-10', 21, 'B+'),
('Sarah Johnson', 'sarah@college.edu', 'student', 'student123', 'active', 'Computer Science', '2233445566', '2003-03-15', 21, 'A-'),
('Michael Brown', 'michael@college.edu', 'student', 'student123', 'active', 'Electronics', '3344556677', '2002-11-22', 22, 'O-')
ON CONFLICT (email) DO NOTHING;

-- Groups
INSERT INTO groups (name, description, created_by, members) VALUES
('Computer Science Students', 'All students from Computer Science department', 'admin@college.edu', '{"student@college.edu", "sarah@college.edu"}'),
('B.Tech 2024 Batch', 'Students from 2024 batch', 'admin@college.edu', '{"student@college.edu", "sarah@college.edu", "michael@college.edu"}')
ON CONFLICT DO NOTHING;

-- Messages
INSERT INTO messages (title, content, sender, sender_role, recipients, priority, schedule_type, total_recipients, read_count, acknowledged) VALUES
('Welcome to Campus Portal', 'Welcome to the new Campus Messaging Portal. This system will help us communicate more effectively across the campus.', 'Admin User', 'admin', 'all', 'high', 'now', 5, 3, false),
('Exam Schedule Released', 'The final examination schedule has been released. Please check the academic portal for detailed timings.', 'Staff Member', 'staff', 'students', 'high', 'now', 3, 2, false),
('Library Hours Extended', 'The library will now be open until 10 PM on weekdays to support your studies.', 'Admin User', 'admin', 'all', 'medium', 'now', 5, 4, false)
ON CONFLICT DO NOTHING;

