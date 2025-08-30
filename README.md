# Leave Management Application (JS + Hono + React Router + Supabase + Google Calendar)

## Tech Stack
- Backend: Hono (Node.js, JavaScript)
- Frontend: React + React Router (Vite)
- Database/Auth: Supabase (Auth + DB + Storage)
- Integration: Google Calendar API (Admin OAuth)
- Notifications: Email (SMTP) + optional Slack webhook
- Deployment: Docker (local dev), optional deploy to Vercel/Heroku

## Features
- Google SSO (Supabase Auth) for Team Members
- Roles: Admin, Manager, Member (profiles.role)
- Leave requests (apply, list, cancel)
- Approval workflow (manager/admin approve/reject)
- On approval: auto-create Google Calendar event
- Unsync on cancel (delete event)
- Admin: manage leave types, projects/regions/groups (endpoints included), assign leave types
- Admin: connect Google (OAuth), set Calendar ID

## Setup

### 1) Supabase
1. Create a Supabase project, get `SUPABASE_URL`, `ANON`, `SERVICE_ROLE`.
2. In Authentication → Providers → Google: enable Google.
3. (Optional) For user login scopes, default `openid email profile` is enough.
4. Run SQL (Schema + Seed) in Supabase SQL editor:
   - `scripts/db/schema.sql`
   - `scripts/db/seed.sql`
5. Add an Admin user in `profiles`:
   - After first login, update `profiles.role` to `ADMIN` for your user.
   - For at least one manager, set `profiles.role` to `MANAGER`.

### 2) Env vars
- Copy `backend/.env.example` to `backend/.env`. Fill Supabase keys and Google OAuth values.
- Copy `frontend/.env.example` to `frontend/.env`. Fill Supabase URL/Anon and backend URL.

Google OAuth (Admin connection):
- Create OAuth Client (Web) in Google Cloud Console.
- Authorized redirect URI: `http://localhost:8787/api/admin/google/oauth/callback`
- Put `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` in `backend/.env`.
- In Admin UI, click "Connect Google" to authorize and store refresh token.
- Set Calendar ID in Admin UI (e.g. `your-calendar-id@group.calendar.google.com`).

### 3) Docker (local)
- From repo root: `docker-compose up --build`
- Frontend: http://localhost:5173
- Backend: http://localhost:8787

### 4) Login
- Click "Sign in with Google".
- First time, `profiles` row is upserted automatically. Promote your user to `ADMIN` in DB.

## API (Summary)
Base URL: `/api`

Auth
- GET `/auth/me` → current user + profile (requires `Authorization: Bearer <access_token>`)
- POST `/auth/profiles/upsert` → ensure profile row exists

Leaves (Member)
- GET `/leaves` → my leaves
- POST `/leaves` → { leave_type_id, reason, start_date, end_date, half_day, total_days }
- DELETE `/leaves/:id` → cancel (unsyncs event if approved)

Approvals (Manager/Admin)
- GET `/approvals/pending`
- POST `/approvals/:id/decision` → { decision: "APPROVED" | "REJECTED", note? }

Admin
- Leave Types:
  - GET `/admin/leave-types`
  - POST `/admin/leave-types` → { name }
  - PATCH `/admin/leave-types/:id` → { name, active }
  - DELETE `/admin/leave-types/:id`
- Assign leave type:
  - POST `/admin/assign-leave-type` → { user_id, leave_type_id }
- Orgs:
  - CRUD: `/admin/projects`, `/admin/regions`, `/admin/groups`
- Google Calendar:
  - GET `/admin/google/oauth/url` -> { url }
  - GET `/admin/google/oauth/callback` (redirect from Google)
  - GET `/admin/google/settings`
  - POST `/admin/google/settings` → { calendar_id }

Headers
- All protected endpoints require `Authorization: Bearer <Supabase access token>`

## Notes
- Calendar events are created under the Admin-connected Google account to the configured Calendar ID.
- Email/Slack notifications are optional; set env vars to enable.
- Everything is JavaScript (no TypeScript) as requested.

## Demo Data
- `scripts/db/seed.sql` seeds leave types, projects, regions, groups.
- After first sign-in, update your `profiles.role` to ADMIN for admin UI access.
