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

-- CRM Tables

create table if not exists crm_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text default '',
  website text default '',
  address text default '',
  phone text default '',
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists crm_contacts (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text default '',
  phone text default '',
  company_id uuid references crm_companies(id) on delete set null,
  job_title text default '',
  tags jsonb default '[]',
  notes text default '',
  linked_opportunity_ids jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default 'slate',
  position integer not null default 0,
  created_at timestamptz default now()
);

create table if not exists pipeline_deals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  value text default '',
  contact_id uuid not null references crm_contacts(id) on delete cascade,
  company_id uuid references crm_companies(id) on delete set null,
  stage_id uuid not null references pipeline_stages(id) on delete cascade,
  opportunity_id uuid references opportunities(id) on delete set null,
  probability integer default 0 check (probability >= 0 and probability <= 100),
  expected_close_date text default '',
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists crm_activities (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references crm_contacts(id) on delete cascade,
  deal_id uuid references pipeline_deals(id) on delete set null,
  type text not null check (type in ('note', 'call', 'email', 'meeting', 'task', 'deal_moved', 'contact_created')),
  title text not null,
  description text default '',
  created_at timestamptz default now()
);
