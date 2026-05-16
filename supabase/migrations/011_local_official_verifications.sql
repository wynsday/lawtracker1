-- supabase/migrations/011_local_official_verifications.sql
-- Community verification for local official submissions

create table if not exists local_official_verifications (
  id          uuid        primary key default gen_random_uuid(),
  official_id uuid        not null references local_officials(id) on delete cascade,
  verified_by uuid        not null references accounts(id),
  created_at  timestamptz not null default now(),
  unique (official_id, verified_by)
);

grant all on local_official_verifications to service_role;

alter table local_officials
  add column if not exists verification_count integer not null default 0;
