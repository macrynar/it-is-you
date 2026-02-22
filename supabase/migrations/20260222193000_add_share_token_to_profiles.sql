-- Public share token for character sheet

alter table public.profiles
  add column if not exists share_token text;

-- Unique token, but allow NULLs
create unique index if not exists profiles_share_token_unique
  on public.profiles (share_token)
  where share_token is not null;
