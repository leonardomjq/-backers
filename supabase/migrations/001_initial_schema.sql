-- Backers initial schema

-- Creators table
create table public.creators (
  id uuid primary key default gen_random_uuid(),
  twitter_handle text unique not null,
  token_mint text,
  display_name text,
  avatar_url text,
  bags_data jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Campaigns table
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  champion_wallet text not null,
  status text not null default 'active',
  amount_sol numeric not null,
  created_at timestamptz default now() not null
);

-- Indexes
create index idx_creators_twitter_handle on public.creators(twitter_handle);
create index idx_campaigns_creator_id on public.campaigns(creator_id);
create index idx_campaigns_champion_wallet on public.campaigns(champion_wallet);

-- updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_creators_updated_at
  before update on public.creators
  for each row
  execute function public.handle_updated_at();

-- RLS
alter table public.creators enable row level security;
alter table public.campaigns enable row level security;

create policy "Public read access to creators"
  on public.creators for select
  using (true);

create policy "Public read access to campaigns"
  on public.campaigns for select
  using (true);
