-- Run this in your Supabase project (SQL Editor) to create the sessions table and storage bucket.

-- Table: sessions (one row per note-taking session per user)
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text default '',
  transcript text default '',
  summary text default '',
  notes jsonb default '[]'::jsonb,
  snapshots jsonb default '[]'::jsonb,
  recording_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- If the table already existed without these columns (e.g. from an older schema), add them now
alter table public.sessions add column if not exists created_at timestamptz default now();
alter table public.sessions add column if not exists updated_at timestamptz default now();

-- RLS: users can only see and modify their own sessions
alter table public.sessions enable row level security;

create policy "Users can do everything on own sessions"
  on public.sessions for all
  using ((auth.uid())::text = (user_id)::text)
  with check ((auth.uid())::text = (user_id)::text);

-- Index for listing sessions by user
create index if not exists sessions_user_id_updated_at on public.sessions (user_id, updated_at desc);

-- Storage: In Supabase Dashboard go to Storage, create a bucket named "recordings" (public).
-- Then in Storage → recordings → Policies, add:
--   Policy "Users can upload own recordings": INSERT with check: (storage.foldername(name))[1] = auth.uid()::text
--   Policy "Users can read own recordings":   SELECT using: (storage.foldername(name))[1] = auth.uid()::text
