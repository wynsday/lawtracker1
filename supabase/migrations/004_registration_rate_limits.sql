-- ============================================================
-- LawTracker — registration rate limit table
-- One row per IP hash; window resets after 1 hour.
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

create table registration_rate_limits (
  ip_hash      text primary key,
  attempts     integer     not null default 1,
  window_start timestamptz not null default now()
);

-- No public access — written only by the auth-register Edge Function
alter table registration_rate_limits enable row level security;
grant all on registration_rate_limits to service_role;
