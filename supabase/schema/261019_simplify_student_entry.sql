alter table public.classroom_game_attempts alter column user_id drop not null;
alter table public.classroom_game_attempts add column student_token_hash text check (student_token_hash ~ '^[0-9a-f]{64}$');
alter table public.classroom_game_attempts add constraint classroom_attempt_identity check (user_id is not null or student_token_hash is not null);
comment on table public.classroom_game_attempts is 'School email is entered, not verified, for student play. Random per-attempt token authorizes answers. Teacher listing requires verified teacher account. No direct browser table grants.';
