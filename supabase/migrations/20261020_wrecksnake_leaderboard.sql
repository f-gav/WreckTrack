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
-- Rank reads and updates go through the authenticated Edge Function; account UUIDs are not publicly exposed.
create or replace function public.record_wrecksnake_score(p_session uuid, p_user uuid, p_score integer, p_ticks integer, p_nickname text)
returns boolean
language plpgsql security definer set search_path = ''
as $wrecksnake_body$
declare claimed uuid;
begin
  update public.wrecksnake_sessions
     set score=p_score, ticks=p_ticks, completed_at=now()
   where id=p_session and user_id=p_user and completed_at is null
   returning id into claimed;
  if claimed is null then return false; end if;
  insert into public.wrecksnake_scores(user_id,nickname,best_score,games_played,total_score,updated_at)
  values(p_user,p_nickname,p_score,1,p_score,now())
  on conflict(user_id) do update set
    best_score=greatest(public.wrecksnake_scores.best_score,excluded.best_score),
    games_played=public.wrecksnake_scores.games_played+1,
    total_score=public.wrecksnake_scores.total_score+excluded.total_score,
    nickname=excluded.nickname,
    updated_at=now();
  return true;
end;
$wrecksnake_body$;
revoke all on function public.record_wrecksnake_score(uuid,uuid,integer,integer,text) from public, anon, authenticated;
grant execute on function public.record_wrecksnake_score(uuid,uuid,integer,integer,text) to service_role;
-- Edge Function verifies the signed-in Google account and recomputes the game independently.
