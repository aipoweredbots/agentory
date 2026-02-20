-- Agentory schema for Supabase (Postgres)
-- Run in Supabase SQL editor.

create extension if not exists "pgcrypto";

create type role as enum ('OWNER', 'ADMIN', 'MEMBER');
create type plan as enum ('FREE', 'PREMIUM', 'PREMIUM_PLUS');
create type subscription_status as enum (
  'ACTIVE',
  'TRIALING',
  'CANCELED',
  'PAST_DUE',
  'INCOMPLETE',
  'INCOMPLETE_EXPIRED',
  'UNPAID'
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique not null,
  image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  role role not null default 'MEMBER',
  created_at timestamptz not null default now(),
  unique(user_id, org_id)
);

create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  slug text unique not null,
  category text not null,
  tags text[] not null default '{}',
  short_description text not null,
  long_description text not null,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  free_try_enabled boolean not null default true,
  premium_only boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid unique not null references organizations(id) on delete cascade,
  plan plan not null default 'FREE',
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status subscription_status not null default 'ACTIVE',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists usage_ledger (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  agent_id uuid references agents(id) on delete set null,
  action_count integer not null,
  credit_count integer not null,
  created_at timestamptz not null default now()
);

create table if not exists usage_month (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  year_month text not null,
  actions_used integer not null default 0,
  credits_used integer not null default 0,
  reset_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(org_id, year_month)
);

create table if not exists invite_tokens (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  email text not null,
  token text unique not null,
  role role not null default 'MEMBER',
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists runs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  agent_id uuid not null references agents(id) on delete cascade,
  input text not null,
  output text not null,
  credits_consumed integer not null,
  actions_consumed integer not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_agents_published_featured on agents (is_published, is_featured);
create index if not exists idx_agents_category on agents (category);
create index if not exists idx_memberships_org on memberships (org_id);
create index if not exists idx_usage_ledger_org_created on usage_ledger (org_id, created_at);
create index if not exists idx_runs_org_created on runs (org_id, created_at);

-- Optional: basic RLS starter (customize for your auth model)
alter table users enable row level security;
alter table organizations enable row level security;
alter table memberships enable row level security;
alter table agents enable row level security;
alter table subscriptions enable row level security;
alter table usage_ledger enable row level security;
alter table usage_month enable row level security;
alter table invite_tokens enable row level security;
alter table runs enable row level security;

-- Example permissive read policy for published agents
create policy if not exists "public_read_published_agents"
  on agents for select
  using (is_published = true);
