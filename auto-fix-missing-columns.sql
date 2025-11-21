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
