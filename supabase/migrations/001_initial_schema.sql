-- ============================================================
-- LawTracker — bills schema
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- BILLS
-- ─────────────────────────────────────────────
create table bills (
  id               integer primary key,
  state            char(2)  not null,          -- 'US' federal | 'MI' michigan/local
  level            text     not null check (level in ('federal','michigan','local')),
  municipality     text,                        -- city/county name for local bills
  amend            text[]   not null default '{}', -- ['4th','1st','due','14th']
  urgency          text     not null check (urgency in ('urgent','months','year','stalled')),
  policy_bias      integer  not null check (policy_bias between 0 and 100),
  issues           text[]   not null default '{}',
  ratify_office    text     not null,
  stage_dates      text[]   not null default '{}', -- null entries allowed inside array
  stage            integer  not null default 0,
  stage_note       text     not null default '',
  name             text     not null,
  bill_desc        text     not null default '',
  introduced       text     not null default '',
  supporters       text     not null default '',
  blockers         text     not null default '',
  influence_window text     not null default '',
  decisions        jsonb    not null default '[]', -- [{label,text}]
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index bills_state_idx    on bills (state);
create index bills_level_idx    on bills (level);
create index bills_urgency_idx  on bills (urgency);
create index bills_office_idx   on bills (ratify_office);
create index bills_updated_idx  on bills (updated_at desc);

-- Auto-update timestamp
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger bills_updated_at
  before update on bills
  for each row execute function set_updated_at();

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY — public read only
-- ─────────────────────────────────────────────
alter table bills enable row level security;

create policy "Public read bills"
  on bills for select using (true);

-- Only the service role (used by the edge function) can write.
-- No public insert/update/delete policy is created intentionally.

-- ─────────────────────────────────────────────
-- TABLE-LEVEL GRANTS
-- ─────────────────────────────────────────────
grant select on bills to anon, authenticated;
grant all    on bills to service_role;
