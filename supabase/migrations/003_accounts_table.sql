-- ============================================================
-- LawTracker — custom auth accounts table
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

create table accounts (
  id                       uuid primary key default gen_random_uuid(),
  username                 text unique not null,
  passcode_hash            text,
  password_hash            text,
  email                    text unique,
  tier                     integer default 1,
  role                     text not null default 'user'
                             check (role in ('user', 'verifier', 'admin')),
  session_token            text,
  session_expires_at       timestamptz,
  failed_passcode_attempts integer not null default 0,
  passcode_locked          boolean not null default false,
  verified_at              timestamptz,
  verified_by              text,
  verified_credential      text,
  address                  text,
  district_info            jsonb,
  created_at               timestamptz not null default now()
);

create index accounts_username_idx       on accounts (username);
create index accounts_session_token_idx  on accounts (session_token);

-- No public access — all auth goes through service_role Edge Functions
alter table accounts enable row level security;
grant all on accounts to service_role;
