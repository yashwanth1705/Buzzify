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
