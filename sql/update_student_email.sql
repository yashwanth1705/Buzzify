-- Run this in your Supabase SQL Editor to update the student email
UPDATE users
SET email = 'yashwanthrathnam@gmail.com'
WHERE role = 'student' AND email = 'student@college.edu';

-- Or if you want to update by ID (assuming ID 3 is stdent)
-- UPDATE users SET email = 'yashwanthrathnam@gmail.com' WHERE id = 3;
