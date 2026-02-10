-- QS Lead Finder - Supabase Schema

create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text not null,
  description text not null,
  estimated_value text,
  stage text not null check (stage in ('Planning', 'Tender', 'Construction')),
  source text,
  url text,
  discovered_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists watchlist_items (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  created_at timestamptz default now(),
  unique(opportunity_id)
);

create table if not exists outreach_assets (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  asset_type text not null check (asset_type in ('email_sequence', 'proposal', 'one_pager')),
  content jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  opportunity_id text not null,
  opportunity_title text not null,
  sections jsonb not null,
  content jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
