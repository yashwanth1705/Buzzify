# Buzzify
<<<<<<< HEAD
Campus portal messaging full stack web portal 
=======

**Make the campus buzz.**

A comprehensive campus communication management system built with Next.js 16, React 19, TypeScript, Supabase, and Zustand.

## Features

### Authentication & Role-Based Access
- **Three User Roles**: Admin, Staff, Student
- **Demo Accounts**:
  - Admin: `admin@college.edu` / `admin123`
  - Staff: `staff@college.edu` / `staff123`
  - Student: `student@college.edu` / `student123`

### Message Management
- **Create Messages**: With priority levels, recipients, scheduling, and attachments
- **Message Feed**: Chronological view of all received messages
- **Message Details**: Full message view with attachments and statistics
- **Acknowledgement System**: Students can acknowledge message receipt

### Notification System
- **Real-time Notifications**: Header notification bell with unread count
- **Click to Navigate**: Direct navigation from notifications to messages

### Admin Panel
- **User Management**: Add, edit, delete users (students & staff)
- **Group Management**: Create and manage custom distribution groups
- **Statistics Dashboard**: User counts, message metrics, read rates
- **System Settings**: Configure retention, upload limits, etc.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **State Management**: Zustand
- **Database**: Supabase PostgreSQL
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Icons**: Lucide React

## Setup Instructions

### 1. Install Dependencies
```bash
cd buzzify
npm install
```

### 2. Set up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Update `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Create Database Tables
Run these SQL commands in your Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'student')),
  password TEXT NOT NULL,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sender TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  recipients TEXT NOT NULL,
  custom_groups JSONB,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT,
  attachments JSONB,
  schedule_type TEXT NOT NULL DEFAULT 'now' CHECK (schedule_type IN ('now', 'later')),
  schedule_date TEXT,
  schedule_time TEXT,
  total_recipients INTEGER NOT NULL,
  read_count INTEGER NOT NULL DEFAULT 0,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledgedBy JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Groups table
CREATE TABLE groups (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  members JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  message_id BIGINT REFERENCES messages(id),
  user_id BIGINT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert demo data
INSERT INTO users (name, email, password, role, status, department, phone_number, dob, age, blood_group) VALUES
('Admin User', 'admin@college.edu', 'admin123', 'admin', 'active', 'Administration', '1234567890', '1985-01-15', 39, 'O+'),
('Staff Member', 'staff@college.edu', 'staff123', 'staff', 'active', 'Computer Science', '0987654321', '1990-05-20', 34, 'A+'),
('John Student', 'student@college.edu', 'student123', 'student', 'active', 'Computer Science', '1122334455', '2003-08-10', 21, 'B+'),
('Sarah Johnson', 'sarah@college.edu', 'student123', 'student', 'active', 'Computer Science', '2233445566', '2003-03-15', 21, 'A-'),
('Michael Brown', 'michael@college.edu', 'student123', 'student', 'active', 'Electronics', '3344556677', '2002-11-22', 22, 'O-');

INSERT INTO messages (title, content, sender, sender_role, recipients, priority, schedule_type, total_recipients, read_count, acknowledged, acknowledgedBy) VALUES
('Welcome to Campus Portal', 'Welcome to the new Campus Messaging Portal. This system will help us communicate more effectively across the campus.', 'Admin User', 'admin', 'all', 'high', 'now', 5, 3, false, '[3]'),
('Exam Schedule Released', 'The final examination schedule has been released. Please check the academic portal for detailed timings.', 'Staff Member', 'staff', 'students', 'high', 'now', 3, 2, false, '[3]'),
('Library Hours Extended', 'The library will now be open until 10 PM on weekdays to support your studies.', 'Admin User', 'admin', 'all', 'medium', 'now', 5, 4, false, '[3,4]');

INSERT INTO groups (name, description, created_by, members) VALUES
('Computer Science Students', 'All students from Computer Science department', 'admin@college.edu', '["student@college.edu", "sarah@college.edu"]'),
('B.Tech 2024 Batch', 'Students from 2024 batch', 'admin@college.edu', '["student@college.edu", "sarah@college.edu", "michael@college.edu"]');
```

### 4. Run the Development Server
```bash
npm run dev
```

### 5. Access the Application
- Open [http://localhost:3000](http://localhost:3000)
- Use the demo accounts to log in and explore the features

## Project Structure

```
buzzify/
├── app/
│   ├── page.tsx (Login)
│   ├── layout.tsx (Root layout)
│   ├── globals.css
│   └── dashboard/
│       ├── page.tsx (Main dashboard)
│       └── components/
│           ├── sidebar.tsx
│           ├── header.tsx
│           ├── message-feed.tsx
│           ├── message-detail.tsx
│           ├── create-message.tsx
│           └── admin-panel.tsx
├── lib/
│   ├── store.ts (Zustand state management)
│   ├── supabase.ts (Database client)
│   └── utils.ts
├── components/
│   └── ui/ (shadcn/ui components)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.local
```

## Key Features Implemented

### Authentication
- Role-based login system
- Session management via Zustand store
- Protected routes

### Message Management
- Create messages with attachments, scheduling, and priority
- Message feed with filtering by role
- Message detail view with statistics
- Acknowledgement system for students

### Notification System
- Real-time notification creation
- Unread count badge
- Click-to-navigate functionality

### Admin Features
- Complete user management (CRUD operations)
- Group management
- Statistics dashboard
- System settings

### UI/UX
- Responsive design for mobile and desktop
- Clean, modern interface with shadcn/ui
- Role-based navigation and features
- Loading states and error handling

## API Routes (Future Implementation)

The application is currently using Zustand for state management with demo data. To connect to Supabase, you would need to implement these API routes:

- `app/api/users/route.ts` - User CRUD operations
- `app/api/messages/route.ts` - Message CRUD operations
- `app/api/groups/route.ts` - Group CRUD operations
- `app/api/notifications/route.ts` - Notification management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
>>>>>>> 3f69db9 (Initial project upload)
# Buzzify
# Buzzify
# Buzzify
# Buzzify
"# Buzzify" 
