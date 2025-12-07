-- Run this in your Supabase SQL Editor to update the admin email
UPDATE users
SET email = 'tamilselvam.cm@gmail.com'
WHERE role = 'admin' AND email = 'admin@college.edu';

-- Or if you want to update by ID (assuming ID 1 is admin)
-- UPDATE users SET email = 'tamilselvam.cm@gmail.com' WHERE id = 1;
