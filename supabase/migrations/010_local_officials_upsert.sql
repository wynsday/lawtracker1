-- supabase/migrations/010_local_officials_upsert.sql
-- Allow upsert: one submission per user per role per state

alter table local_officials
  add constraint local_officials_role_state_user_unique
  unique (role, state, submitted_by);
