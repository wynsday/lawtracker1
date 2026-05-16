-- supabase/migrations/008_local_officials_dates.sql
-- Add elected and term-end date fields to local_officials

alter table local_officials
  add column if not exists since      date,
  add column if not exists term_ends  date;
