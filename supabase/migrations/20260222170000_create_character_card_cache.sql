-- Character card LLM cache

create table if not exists public.character_card_cache (
  user_id uuid primary key references auth.users(id) on delete cascade,
  generated_at timestamptz not null default now(),
  content jsonb not null
);

alter table public.character_card_cache enable row level security;

drop policy if exists "Users can view own character card cache" on public.character_card_cache;
drop policy if exists "Users can insert own character card cache" on public.character_card_cache;
drop policy if exists "Users can update own character card cache" on public.character_card_cache;
drop policy if exists "Users can delete own character card cache" on public.character_card_cache;

create policy "Users can view own character card cache"
  on public.character_card_cache
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own character card cache"
  on public.character_card_cache
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own character card cache"
  on public.character_card_cache
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own character card cache"
  on public.character_card_cache
  for delete
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.character_card_cache to authenticated;
