# Campus Messaging Portal — Project Overview

This document describes the `campus-messaging-portal` repository: architecture, key files, data model, important flows, setup steps, and recommended next steps.

---

## Purpose

A lightweight campus messaging portal to compose and deliver messages to campus users (admins, staff, students), manage departments/groups/users, persist data to Supabase, and track reads/acknowledgements and notifications.

## Tech Stack

- Next.js (App Router) with TypeScript
- Zustand for client state (`lib/store.ts`)
- Supabase (Postgres) as primary persistence (client in `lib/supabase.ts`)
- Tailwind CSS for styling
- Custom UI primitives in `components/ui/*`
- Icons: `lucide-react`

## High-level Architecture

- Client-rendered React components in the `app/` folder implement the UI and interact with the central store.
- `lib/store.ts` is the single app state layer (Zustand) and contains both local state and Supabase CRUD logic.
- Supabase is used as the source of truth when available; the app falls back to local state for development/offline scenarios.

## File Map (important files)

- `package.json`, `next.config.js`, `tsconfig.json`, `tailwind.config.ts` — project config
- `lib/supabase.ts` — Supabase client setup and TypeScript types for tables
- `lib/store.ts` — global app state, actions (login, CRUD for users/groups/departments/messages), notifications, fetch helpers
- `app/layout.tsx`, `app/globals.css` — app shell and global styles
- `app/dashboard/page.tsx` — dashboard entry
- `app/dashboard/components/`
  - `message-feed.tsx` — message list and summary UI (highlights unacknowledged messages for students)
  - `message-detail.tsx` — message details view; marks message as read and exposes acknowledge button for students
  - `create-message.tsx` — message composer (recipients, custom groups, preview, scheduling)
  - `admin-panel.tsx` — admin UI for users/groups/departments management (department dialog, multi-department groups, member selection, select all)
- `components/ui/*` — small reusable UI components (Badge, Button, Card, Dialog, Input, Select, etc.)
- `SUPABASE_SETUP.sql` & `SUPABASE_SETUP.md` — SQL schema and setup instructions for the Supabase DB

## Data Model (as used in code)

- `User`: id, name, email, password (demo), role (`admin|staff|student`), status, department, phone, course, sub_course, responsible_staff, dob, age, blood_group, created_at, updated_at
- `Message`: id, title, content, sender, sender_role, recipients (`all|students|staff|custom`), `custom_groups`, priority, attachments, schedule fields, total_recipients, read_count, acknowledged, acknowledgedBy (user ids array), created_at, updated_at
- `Group`: id, name, description, created_by, members (emails), departments, created_at, updated_at
- `Department`: id, name, description, head_of_department, created_by, created_at, updated_at
- `Notification`: id, message_id, user_id, message (text), read (bool), created_at

## Important Flows

- Sending a Message:
  - `create-message.tsx` calls `addMessage` in `lib/store.ts`.
  - `addMessage` attempts to persist to Supabase; on success or fallback it creates a `Message` locally.
  - The store then creates one notification per recipient by calling `addNotification` for each recipient.
  - `addMessage` now `await`s `addNotification` to avoid race conditions that could lead to duplicate notifications.

- Notifications and Dedup:
  - `addNotification` is implemented as `async` and performs a best-effort dedup check:
    - checks local `notifications` for an existing `(message_id, user_id)`
    - checks Supabase for an existing notification row with the same keys (best-effort; logs but continues if Supabase is unavailable)
    - inserts into Supabase when possible and uses returned row to keep IDs consistent
    - falls back to a local insertion if Supabase is unavailable
  - For robust, race-free dedup protection, add a DB-level unique constraint on `(message_id, user_id)` (SQL snippet below).

- Acknowledgement:
  - Students can acknowledge messages only from the Message Details view (`message-detail.tsx`).
  - Viewing a message triggers `markMessageAsRead` once (via a `useRef` guard in the details view).
  - `acknowledgeMessage` updates `acknowledgedBy` on the message.
  - The feed (`message-feed.tsx`) highlights unacknowledged messages for the current student (badge + yellow accent), but the acknowledge UI is only in the details view.

## Setup & Run (local dev)

1. Create `.env.local` with your Supabase values:

```text
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

2. (Optional) Bootstrapping DB: run `SUPABASE_SETUP.sql` in the Supabase SQL editor or psql to create required tables and demo policies.

3. Install dependencies and run the dev server:

```powershell
npm install
npm run dev
```

If you hit permission issues with `.next` (EPERM), delete `.next` and restart the server.

## Recommended DB Constraint (prevent duplicate notifications)

Add this to your Supabase (SQL editor) to enforce uniqueness at the DB level:

```sql
ALTER TABLE notifications
ADD CONSTRAINT uniq_message_user UNIQUE (message_id, user_id);
```

This ensures duplicates cannot be created even under concurrent races.

## Known Issues & Recommendations

- Passwords are stored in demo plaintext — migrate to Supabase Auth for production and remove local plaintext storage.
- For very large recipient lists, creating notifications per recipient on the client can block UI — consider moving to a server-side job/queue for bulk operations.
- `addNotification` checks Supabase and local state for dedup, but a DB constraint is the strongest protection.
- Add automated tests (unit and integration) for store actions; add database migration/versioning.

## Next Steps / Enhancements

- Add Supabase Auth integration and role-based row policies.
- Add DB-level unique constraint for notifications (see snippet above).
- Implement a background worker (serverless function or queue) for sending emails/notifications at scale.
- Add tests and CI for basic flows.

---

If you'd like, I can also:
- Add this content into `README.md` instead of a separate file, or
- Create a short `QUICKSTART.md` with step-by-step commands and environment examples, or
- Add the DB unique constraint as a migration file.

File created: `PROJECT_OVERVIEW.md`
