-- WreckSnake worldwide ranking; score mutations are restricted to the server-side Edge Function.
create table if not exists public.wrecksnake_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  seed bigint not null check (seed between 0 and 4294967295),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  score integer,
  ticks integer
);
create index if not exists wrecksnake_sessions_user_time_idx on public.wrecksnake_sessions (user_id, created_at desc);
alter table public.wrecksnake_sessions enable row level security;
revoke all on public.wrecksnake_sessions from anon, authenticated;

create table if not exists public.wrecksnake_scores (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 32),
  best_score integer not null default 0 check (best_score between 0 and 4000),
  games_played integer not null default 0 check (games_played >= 0),
  total_score bigint not null default 0 check (total_score >= 0),
  updated_at timestamptz not null default now()
);
alter table public.wrecksnake_scores enable row level security;
revoke all on public.wrecksnake_scores from anon, authenticated;
grant select on public.wrecksnake_scores to anon, authenticated;
drop policy if exists wrecksnake_scores_read_all on public.wrecksnake_scores;
create policy wrecksnake_scores_read_all on public.wrecksnake_scores for select to anon, authenticated using (true);
-- Edge Function uses SUPABASE_SERVICE_ROLE_KEY and verifies the Google-authenticated caller.
