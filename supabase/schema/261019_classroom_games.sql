create table public.classroom_game_attempts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 student_email text not null check (student_email ~ '^[^@[:space:]]+@colegiointernacional[.]edu[.]mx$'),
 student_name text not null check (char_length(student_name) between 3 and 100),
 student_group text not null check (student_group in ('9A','10A')),
 game_id text not null check (game_id in ('261020_9A_parallel','261020_10A_semicolons')),
 tasks jsonb not null default '[]'::jsonb,
 extras jsonb not null default '[]'::jsonb,
 score integer not null default 0 check (score between 0 and 40),
 completed boolean not null default false,
 version integer not null default 0,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(id,user_id)
);
alter table public.classroom_game_attempts enable row level security;
revoke all on public.classroom_game_attempts from public, anon, authenticated;
grant all on public.classroom_game_attempts to service_role;
create index classroom_attempts_user_game on public.classroom_game_attempts(user_id,game_id,created_at desc);
create index classroom_attempts_teacher_results on public.classroom_game_attempts(completed,updated_at desc);
comment on table public.classroom_game_attempts is 'Access only through classroom-games Edge Function: verified school identity, row ownership, explicit teacher authorization, server scoring. No direct client table grants.';
