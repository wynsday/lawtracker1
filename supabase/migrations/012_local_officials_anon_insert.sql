-- supabase/migrations/012_local_officials_anon_insert.sql
-- Switch submitted_by from UUID FK to text (username) so the anon client
-- can insert directly without going through an edge function.

alter table local_officials
  drop constraint if exists local_officials_role_state_user_unique;

alter table local_officials
  drop column if exists submitted_by;

alter table local_officials
  add column submitted_by text;

alter table local_officials
  add constraint local_officials_role_state_user_unique
  unique (role, state, submitted_by);

-- Allow the anon client to insert and update rows
grant insert, update on local_officials to anon, authenticated;

create policy "local_officials_insert" on local_officials
  for insert with check (true);

create policy "local_officials_update" on local_officials
  for update using (true) with check (true);
