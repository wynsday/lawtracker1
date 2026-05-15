-- ============================================================
-- LawTracker — representatives table
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

create table representatives (
  id            uuid        primary key default gen_random_uuid(),
  bioguide_id   text        not null unique,          -- Congress.gov stable ID (e.g. "P000595")
  name          text        not null,
  party         text        not null,                 -- 'Democrat' | 'Republican' | 'Independent'
  state         char(2)     not null,                 -- e.g. 'MI'
  district      text,                                 -- NULL for senators; '1'..'13' for House
  chamber       text        not null check (chamber in ('Senate', 'House')),
  url           text,                                 -- congress.gov member URL
  photo_url     text,                                 -- depiction image URL from Congress.gov
  source        text        not null default 'congress.gov',
  verified      boolean     not null default false,
  updated_at    timestamptz not null default now()
);

-- Index for the most common lookups
create index representatives_state_chamber_idx on representatives (state, chamber);
create index representatives_state_district_idx on representatives (state, district);

-- RLS
alter table representatives enable row level security;

-- Public read
create policy "public read representatives"
  on representatives for select
  using (true);

-- Service role full access (seed script, edge functions)
create policy "service role write representatives"
  on representatives for all
  using (auth.role() = 'service_role');

grant select on representatives to anon, authenticated;
grant all    on representatives to service_role;
