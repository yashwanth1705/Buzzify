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
