
-- Insert the missing user into the users table
INSERT INTO public.users (
    email,
    password,
    role,
    name,
    status,
    department,
    phone_number,
    dob,
    age,
    blood_group,
    created_at,
    updated_at
) VALUES (
    '202317B2255@wilp.bits-pilani.ac.in',
    'admin123',
    'admin',
    'Admin User (202317B2255)',
    'active',
    'Administration',
    '1234567890',
    '1990-01-01',
    35,
    'O+',
    NOW(),
    NOW()
);
