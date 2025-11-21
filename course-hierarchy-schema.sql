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
