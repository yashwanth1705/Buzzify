# Supabase Setup Instructions

The application uses Supabase as the backend database. To get messages and other data to appear in Supabase, you need to:

## 1. Set Up Supabase Tables

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to the **SQL Editor**
3. Create a new query and paste the contents of `SUPABASE_SETUP.sql` file
4. Run the query to create all necessary tables

## 2. Verify Environment Variables

The `.env.local` file should already have:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

These are already configured in your project.

## 3. Tables Created

The setup script creates the following tables:
- **users** - Store user information (admin, staff, students)
- **messages** - Store all posted messages
- **groups** - Store group information with members
- **departments** - Store department information
- **notifications** - Store notifications for messages

## 4. Data Flow

Once tables are set up:
1. When you create a user in the admin panel → Data is saved to Supabase `users` table
2. When you post a message → Data is saved to Supabase `messages` table
3. When you create a group → Data is saved to Supabase `groups` table
4. When you create a department → Data is saved to Supabase `departments` table

## 5. Troubleshooting

If messages aren't appearing in Supabase:
- Check the browser console for errors (F12 → Console tab)
- Look for "Supabase insert error" messages
- Verify that all tables were created successfully in Supabase
- Ensure environment variables are correctly set in `.env.local`

## 6. Row Level Security (RLS)

The setup enables RLS with public access policies. For production, you should implement proper authentication-based policies.
