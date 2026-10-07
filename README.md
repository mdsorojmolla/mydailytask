# My Day

A personal routine and task management web app built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## What is implemented

- Google-only Supabase authentication with protected app routes.
- Row-level-security-ready PostgreSQL schema in `supabase/schema.sql`.
- University routine CRUD, class enable/disable, and per-date class cancellation.
- Daily and weekly tasks with priority, status changes, rescheduling, and task history.
- Personal activities with enable/disable, tracking, reminders, and activity history.
- Holidays that affect classes without deleting personal tasks.
- A central schedule engine used by Home, Calendar, reminders, and tests.
- Browser notification runtime with state-aware reminder filtering.
- Routine file upload to Supabase Storage with review-required handling.
- Responsive desktop sidebar and mobile bottom navigation.

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Enable Google OAuth in Supabase Auth.
4. Add the callback URL:

   ```text
   http://localhost:3000/auth/callback
   ```

5. Copy `.env.example` to `.env.local` and fill in:

   ```text
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   `NEXT_PUBLIC_SUPABASE_ANON_KEY` is also supported for projects using the legacy key.

6. Install dependencies and run the app:

   ```bash
   npm install
   npm run dev
   ```

## Verification

```bash
npm run test
npm run build
```

The schedule engine is intentionally independent from React so it can be tested without rendering pages.
