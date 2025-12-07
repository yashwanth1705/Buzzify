
-- ==========================================
-- File: add_department_to_comments.sql
-- ==========================================

-- Add user_department column to comments table
ALTER TABLE comments ADD COLUMN IF NOT EXISTS user_department VARCHAR(255);

-- ==========================================
-- File: auto-fix-missing-columns.sql
-- ==========================================

-- Auto-Fix SQL Script: Add Missing Columns to Existing Tables
-- Run this in Supabase SQL Editor to ensure all required columns exist
-- Safe to run multiple times - uses IF NOT EXISTS and ALTER TABLE ADD COLUMN




-- ===========================================
-- USERS TABLE: Add missing columns
-- ===========================================

-- Add course column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'course') THEN
        ALTER TABLE users ADD COLUMN course VARCHAR(255);
    END IF;
END $$;

-- Add sub_course column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'sub_course') THEN
        ALTER TABLE users ADD COLUMN sub_course VARCHAR(255);
    END IF;
END $$;

-- Add phone_number column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'phone_number') THEN
        ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
    END IF;
END $$;

-- Add dob (date of birth) column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'dob') THEN
        ALTER TABLE users ADD COLUMN dob DATE;
    END IF;
END $$;

-- Add age column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'age') THEN
        ALTER TABLE users ADD COLUMN age INTEGER;
    END IF;
END $$;

-- Add blood_group column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'blood_group') THEN
        ALTER TABLE users ADD COLUMN blood_group VARCHAR(10);
    END IF;
END $$;

-- Add parent_phone column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'parent_phone') THEN
        ALTER TABLE users ADD COLUMN parent_phone VARCHAR(20);
    END IF;
END $$;

-- Add responsible_staff column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'responsible_staff') THEN
        ALTER TABLE users ADD COLUMN responsible_staff VARCHAR(255);
    END IF;
END $$;

-- Add updated_at column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ===========================================
-- DEPARTMENTS TABLE: Add missing columns
-- ===========================================

-- Add description column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'departments' AND column_name = 'description') THEN
        ALTER TABLE departments ADD COLUMN description TEXT;
    END IF;
END $$;

-- Add head_of_department column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'departments' AND column_name = 'head_of_department') THEN
        ALTER TABLE departments ADD COLUMN head_of_department VARCHAR(255);
    END IF;
END $$;

-- Add created_by column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'departments' AND column_name = 'created_by') THEN
        ALTER TABLE departments ADD COLUMN created_by VARCHAR(255);
    END IF;
END $$;

-- Add updated_at column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'departments' AND column_name = 'updated_at') THEN
        ALTER TABLE departments ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ===========================================
-- COURSES TABLE: Add missing columns
-- ===========================================

-- Add code column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'courses' AND column_name = 'code') THEN
        ALTER TABLE courses ADD COLUMN code VARCHAR(50);
    END IF;
END $$;

-- Add description column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'courses' AND column_name = 'description') THEN
        ALTER TABLE courses ADD COLUMN description TEXT;
    END IF;
END $$;

-- Add updated_at column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'courses' AND column_name = 'updated_at') THEN
        ALTER TABLE courses ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ===========================================
-- SUB_COURSES TABLE: Add missing columns
-- ===========================================

-- Add code column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'sub_courses' AND column_name = 'code') THEN
        ALTER TABLE sub_courses ADD COLUMN code VARCHAR(50);
    END IF;
END $$;

-- Add description column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'sub_courses' AND column_name = 'description') THEN
        ALTER TABLE sub_courses ADD COLUMN description TEXT;
    END IF;
END $$;

-- Add updated_at column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'sub_courses' AND column_name = 'updated_at') THEN
        ALTER TABLE sub_courses ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ===========================================
-- MESSAGES TABLE: Add missing columns
-- ===========================================

-- Add schedule_type column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'messages' AND column_name = 'schedule_type') THEN
        ALTER TABLE messages ADD COLUMN schedule_type VARCHAR(20) DEFAULT 'now';
    END IF;
END $$;

-- Add schedule_date column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'messages' AND column_name = 'schedule_date') THEN
        ALTER TABLE messages ADD COLUMN schedule_date DATE;
    END IF;
END $$;

-- Add schedule_time column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'messages' AND column_name = 'schedule_time') THEN
        ALTER TABLE messages ADD COLUMN schedule_time TIME;
    END IF;
END $$;

-- Add total_recipients column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'messages' AND column_name = 'total_recipients') THEN
        ALTER TABLE messages ADD COLUMN total_recipients INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add read_count column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'messages' AND column_name = 'read_count') THEN
        ALTER TABLE messages ADD COLUMN read_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add acknowledged column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'messages' AND column_name = 'acknowledged') THEN
        ALTER TABLE messages ADD COLUMN acknowledged BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add acknowledgedBy column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public'
                     AND table_name = 'messages'
                     AND lower(column_name) = 'acknowledgedby') THEN
        ALTER TABLE messages ADD COLUMN acknowledgedBy INTEGER[];
    END IF;
END $$;

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================

-- Check all tables have required columns
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('users', 'departments', 'courses', 'sub_courses', 'messages', 'groups', 'notifications')
    AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Summary message
DO $$
BEGIN
    RAISE NOTICE 'Auto-fix completed! All missing columns have been added to existing tables.';
    RAISE NOTICE 'Run the verification query above to confirm all columns exist.';
END $$;

-- ==========================================
-- File: COMPLETE_SETUP.sql
-- ==========================================

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


-- ==========================================
-- File: course-hierarchy-queries.sql
-- ==========================================

-- Course Hierarchy Queries for Campus Messaging Portal
-- These SQL queries demonstrate how to fetch department -> course -> sub_course data for dropdowns

-- 1. Get all departments (for first dropdown)
SELECT id, name, description
FROM departments
ORDER BY name;

-- 2. Get all courses for a specific department (when department is selected)
-- Replace $1 with the selected department_id
SELECT id, name, code, description
FROM courses
WHERE department_id = $1
ORDER BY name;

-- 3. Get all sub-courses for a specific course (when course is selected)
-- Replace $1 with the selected course_id
SELECT id, name, code, description
FROM sub_courses
WHERE course_id = $1
ORDER BY name;

-- 4. Get complete hierarchy for a department (for debugging/validation)
-- Replace $1 with the department_id
SELECT
  d.name as department_name,
  c.name as course_name,
  c.code as course_code,
  sc.name as sub_course_name,
  sc.code as sub_course_code
FROM departments d
LEFT JOIN courses c ON d.id = c.department_id
LEFT JOIN sub_courses sc ON c.id = sc.course_id
WHERE d.id = $1
ORDER BY c.name, sc.name;

-- 5. Get all possible combinations (for admin overview)
SELECT
  d.name as department_name,
  c.name as course_name,
  sc.name as sub_course_name
FROM departments d
JOIN courses c ON d.id = c.department_id
JOIN sub_courses sc ON c.id = sc.course_id
ORDER BY d.name, c.name, sc.name;

-- 6. Check if department has courses (for validation)
SELECT COUNT(*) as course_count
FROM courses
WHERE department_id = $1;

-- 7. Check if course has sub-courses (for validation)
SELECT COUNT(*) as sub_course_count
FROM sub_courses
WHERE course_id = $1;

-- Example usage in application:
-- When user selects "Engineering" department:
-- 1. Get department_id for "Engineering"
-- 2. Query courses where department_id = engineering_id
-- 3. Show courses like "BE", "BTECH", "ME"
-- 4. When user selects "BE":
-- 5. Query sub_courses where course_id = be_course_id
-- 6. Show sub-courses like "Computer Science", "Mechanical", "Civil", etc.

-- ==========================================
-- File: course-hierarchy-schema.sql
-- ==========================================

-- Course Hierarchy Schema for Campus Messaging Portal
-- This creates a hierarchical relationship: Department -> Course -> Sub Course
-- Run these SQL commands in your Supabase SQL Editor

-- Courses table (linked to departments)
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50), -- e.g., "BE", "BTECH", "ME"
  description TEXT,
  department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT courses_department_name_unique UNIQUE(department_id, name) -- Prevent duplicate course names within same department
);

-- Sub Courses table (linked to courses)
CREATE TABLE IF NOT EXISTS sub_courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50), -- e.g., "CSE", "MECH", "CIVIL"
  description TEXT,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT sub_courses_course_name_unique UNIQUE(course_id, name) -- Prevent duplicate sub-course names within same course
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_department_id ON courses(department_id);
CREATE INDEX IF NOT EXISTS idx_sub_courses_course_id ON sub_courses(course_id);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_courses_updated_at') THEN
        CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sub_courses_updated_at') THEN
        CREATE TRIGGER update_sub_courses_updated_at BEFORE UPDATE ON sub_courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Insert demo data for existing departments
-- Use Computer Science department as example
INSERT INTO courses (name, code, description, department_id, created_by) VALUES
('Bachelor of Engineering', 'BE', 'Bachelor of Engineering program', (SELECT id FROM departments WHERE name = 'Computer Science' LIMIT 1), 'admin@college.edu'),
('Bachelor of Technology', 'BTECH', 'Bachelor of Technology program', (SELECT id FROM departments WHERE name = 'Computer Science' LIMIT 1), 'admin@college.edu'),
('Master of Engineering', 'ME', 'Master of Engineering program', (SELECT id FROM departments WHERE name = 'Computer Science' LIMIT 1), 'admin@college.edu')
ON CONFLICT (department_id, name) DO NOTHING;

-- Insert sub-courses for BE course
INSERT INTO sub_courses (name, code, description, course_id, created_by) VALUES
('Computer Science and Engineering', 'CSE', 'Computer Science and Engineering specialization', (SELECT id FROM courses WHERE name = 'Bachelor of Engineering' AND code = 'BE' LIMIT 1), 'admin@college.edu'),
('Mechanical Engineering', 'MECH', 'Mechanical Engineering specialization', (SELECT id FROM courses WHERE name = 'Bachelor of Engineering' AND code = 'BE' LIMIT 1), 'admin@college.edu'),
('Civil Engineering', 'CIVIL', 'Civil Engineering specialization', (SELECT id FROM courses WHERE name = 'Bachelor of Engineering' AND code = 'BE' LIMIT 1), 'admin@college.edu'),
('Electrical Engineering', 'EE', 'Electrical Engineering specialization', (SELECT id FROM courses WHERE name = 'Bachelor of Engineering' AND code = 'BE' LIMIT 1), 'admin@college.edu'),
('Electronics and Communication', 'ECE', 'Electronics and Communication Engineering specialization', (SELECT id FROM courses WHERE name = 'Bachelor of Engineering' AND code = 'BE' LIMIT 1), 'admin@college.edu'),
('Information Technology', 'IT', 'Information Technology specialization', (SELECT id FROM courses WHERE name = 'Bachelor of Engineering' AND code = 'BE' LIMIT 1), 'admin@college.edu')
ON CONFLICT (course_id, name) DO NOTHING;

-- Insert sub-courses for BTECH course
INSERT INTO sub_courses (name, code, description, course_id, created_by) VALUES
('Computer Science and Engineering', 'CSE', 'Computer Science and Engineering specialization', (SELECT id FROM courses WHERE name = 'Bachelor of Technology' AND code = 'BTECH' LIMIT 1), 'admin@college.edu'),
('Mechanical Engineering', 'MECH', 'Mechanical Engineering specialization', (SELECT id FROM courses WHERE name = 'Bachelor of Technology' AND code = 'BTECH' LIMIT 1), 'admin@college.edu'),
('Civil Engineering', 'CIVIL', 'Civil Engineering specialization', (SELECT id FROM courses WHERE name = 'Bachelor of Technology' AND code = 'BTECH' LIMIT 1), 'admin@college.edu'),
('Electrical and Electronics', 'EEE', 'Electrical and Electronics Engineering specialization', (SELECT id FROM courses WHERE name = 'Bachelor of Technology' AND code = 'BTECH' LIMIT 1), 'admin@college.edu'),
('Electronics and Communication', 'ECE', 'Electronics and Communication Engineering specialization', (SELECT id FROM courses WHERE name = 'Bachelor of Technology' AND code = 'BTECH' LIMIT 1), 'admin@college.edu')
ON CONFLICT (course_id, name) DO NOTHING;

-- Insert sub-courses for ME course
INSERT INTO sub_courses (name, code, description, course_id, created_by) VALUES
('Computer Science and Engineering', 'CSE', 'Computer Science and Engineering specialization', (SELECT id FROM courses WHERE name = 'Master of Engineering' AND code = 'ME' LIMIT 1), 'admin@college.edu'),
('Mechanical Engineering', 'MECH', 'Mechanical Engineering specialization', (SELECT id FROM courses WHERE name = 'Master of Engineering' AND code = 'ME' LIMIT 1), 'admin@college.edu'),
('Civil Engineering', 'CIVIL', 'Civil Engineering specialization', (SELECT id FROM courses WHERE name = 'Master of Engineering' AND code = 'ME' LIMIT 1), 'admin@college.edu'),
('Structural Engineering', 'SE', 'Structural Engineering specialization', (SELECT id FROM courses WHERE name = 'Master of Engineering' AND code = 'ME' LIMIT 1), 'admin@college.edu')
ON CONFLICT (course_id, name) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_courses ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on courses' AND tablename = 'courses') THEN
        CREATE POLICY "Allow all operations on courses" ON courses FOR ALL USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on sub_courses' AND tablename = 'sub_courses') THEN
        CREATE POLICY "Allow all operations on sub_courses" ON sub_courses FOR ALL USING (true);
    END IF;
END $$;

-- Useful queries for dropdown population

-- Query to get all courses for a specific department
-- SELECT id, name, code FROM courses WHERE department_id = $1 ORDER BY name;

-- Query to get all sub-courses for a specific course
-- SELECT id, name, code FROM sub_courses WHERE course_id = $1 ORDER BY name;

-- Query to get department -> course -> sub_course hierarchy
-- SELECT
--   d.name as department_name,
--   c.name as course_name,
--   sc.name as sub_course_name
-- FROM departments d
-- JOIN courses c ON d.id = c.department_id
-- JOIN sub_courses sc ON c.id = sc.course_id
-- ORDER BY d.name, c.name, sc.name;

-- ==========================================
-- File: create_comments_table.sql
-- ==========================================

-- Create comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  parent_comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  user_id INTEGER,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  user_role VARCHAR(50),
  content TEXT NOT NULL,
  mentions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comments_message_id ON comments(message_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on comments" ON comments FOR ALL USING (true);

-- Grant permissions to authenticated and anon users (adjust as needed)
GRANT ALL ON comments TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE comments_id_seq TO anon, authenticated, service_role;

-- ==========================================
-- File: FIX_SCHEMA.sql
-- ==========================================

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

-- 5. Ensure 'read_by' column exists for tracking unique reads
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_by INTEGER[] DEFAULT '{}';

-- ==========================================
-- File: SUPABASE_SETUP.sql
-- ==========================================

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

-- ==========================================
-- File: supabase-schema.sql
-- ==========================================

-- Campus Messaging Portal Database Schema
-- Run these SQL commands in your Supabase SQL Editor to create the database tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'staff', 'student')),
  password VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  phone_number VARCHAR(20),
  department VARCHAR(255),
  course VARCHAR(255),
  sub_course VARCHAR(255),
  dob DATE,
  age INTEGER,
  blood_group VARCHAR(10),
  parent_phone VARCHAR(20),
  responsible_staff VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  head_of_department VARCHAR(255),
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  department VARCHAR(255),
  departments TEXT[], -- Array of department names (for multi-department groups)
  created_by VARCHAR(255) NOT NULL,
  members TEXT[], -- Array of email addresses
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  sender VARCHAR(255) NOT NULL,
  sender_role VARCHAR(50) NOT NULL,
  recipients VARCHAR(50) NOT NULL, -- 'all', 'students', 'staff', or custom
  custom_groups INTEGER[], -- Array of group IDs for custom recipients
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category VARCHAR(255),
  attachments TEXT[], -- Array of file URLs/paths
  schedule_type VARCHAR(50) DEFAULT 'now' CHECK (schedule_type IN ('now', 'later')),
  schedule_date DATE,
  schedule_time TIME,
  total_recipients INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  read_by INTEGER[], -- Array of user IDs who read the message
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by INTEGER[], -- Array of user IDs who acknowledged
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Acknowledgements table
CREATE TABLE IF NOT EXISTS acknowledgements (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  user_role VARCHAR(50),
  acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);

CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);

CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender);
CREATE INDEX IF NOT EXISTS idx_messages_priority ON messages(priority);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_message_id ON notifications(message_id);

CREATE INDEX IF NOT EXISTS idx_acknowledgements_message_id ON acknowledgements(message_id);
CREATE INDEX IF NOT EXISTS idx_acknowledgements_user_id ON acknowledgements(user_id);
CREATE INDEX IF NOT EXISTS idx_acknowledgements_user_email ON acknowledgements(user_email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments table for message replies/threads
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  parent_comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  user_id INTEGER,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  user_role VARCHAR(50),
  content TEXT NOT NULL,
  mentions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_message_id ON comments(message_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Simple policy to allow inserts/selects (adjust for production security)
CREATE POLICY IF NOT EXISTS "Allow all operations on comments" ON comments FOR ALL USING (true);

-- Insert demo data
-- Demo departments
INSERT INTO departments (name, description, head_of_department, created_by) VALUES
('Computer Science', 'Department of Computer Science and Engineering', 'Dr. Smith', 'admin@college.edu'),
('Electronics', 'Department of Electronics and Communication', 'Dr. Johnson', 'admin@college.edu'),
('Mechanical Engineering', 'Department of Mechanical Engineering', 'Dr. Brown', 'admin@college.edu'),
('Civil Engineering', 'Department of Civil Engineering', 'Dr. Davis', 'admin@college.edu'),
('Administration', 'Administrative Department', 'Principal', 'admin@college.edu')
ON CONFLICT (name) DO NOTHING;

-- Demo users
INSERT INTO users (name, email, role, password, status, department, phone_number, dob, age, blood_group) VALUES
('Admin User', 'admin@college.edu', 'admin', 'admin123', 'active', 'Administration', '1234567890', '1985-01-15', 39, 'O+'),
('Staff Member', 'staff@college.edu', 'staff', 'staff123', 'active', 'Computer Science', '0987654321', '1990-05-20', 34, 'A+'),
('John Student', 'student@college.edu', 'student', 'student123', 'active', 'Computer Science', '1122334455', '2003-08-10', 21, 'B+'),
('Sarah Johnson', 'sarah@college.edu', 'student', 'student123', 'active', 'Computer Science', '2233445566', '2003-03-15', 21, 'A-'),
('Michael Brown', 'michael@college.edu', 'student', 'student123', 'active', 'Electronics', '3344556677', '2002-11-22', 22, 'O-')
ON CONFLICT (email) DO NOTHING;

-- Demo groups
INSERT INTO groups (name, description, created_by, members) VALUES
('Computer Science Students', 'All students from Computer Science department', 'admin@college.edu', '{"student@college.edu", "sarah@college.edu"}'),
('B.Tech 2024 Batch', 'Students from 2024 batch', 'admin@college.edu', '{"student@college.edu", "sarah@college.edu", "michael@college.edu"}')
ON CONFLICT DO NOTHING;

-- Demo messages
INSERT INTO messages (title, content, sender, sender_role, recipients, priority, schedule_type, total_recipients, read_count, acknowledged) VALUES
('Welcome to Campus Portal', 'Welcome to the new Campus Messaging Portal. This system will help us communicate more effectively across the campus.', 'Admin User', 'admin', 'all', 'high', 'now', 5, 3, false),
('Exam Schedule Released', 'The final examination schedule has been released. Please check the academic portal for detailed timings.', 'Staff Member', 'staff', 'students', 'high', 'now', 3, 2, false),
('Library Hours Extended', 'The library will now be open until 10 PM on weekdays to support your studies.', 'Admin User', 'admin', 'all', 'medium', 'now', 5, 4, false)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS) - Optional but recommended for production
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow all operations for demo - customize for production)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on departments" ON departments FOR ALL USING (true);
CREATE POLICY "Allow all operations on groups" ON groups FOR ALL USING (true);
CREATE POLICY "Allow all operations on messages" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on notifications" ON notifications FOR ALL USING (true);
CREATE POLICY "Allow all operations on acknowledgements" ON acknowledgements FOR ALL USING (true);

-- ==========================================
-- File: update_admin_email.sql
-- ==========================================

-- Run this in your Supabase SQL Editor to update the admin email
UPDATE users
SET email = 'tamilselvam.cm@gmail.com'
WHERE role = 'admin' AND email = 'admin@college.edu';

-- Or if you want to update by ID (assuming ID 1 is admin)
-- UPDATE users SET email = 'tamilselvam.cm@gmail.com' WHERE id = 1;

-- ==========================================
-- File: update_student_email.sql
-- ==========================================

-- Run this in your Supabase SQL Editor to update the student email
UPDATE users
SET email = 'yashwanthrathnam@gmail.com'
WHERE role = 'student' AND email = 'student@college.edu';

-- Or if you want to update by ID (assuming ID 3 is stdent)
-- UPDATE users SET email = 'yashwanthrathnam@gmail.com' WHERE id = 3;
