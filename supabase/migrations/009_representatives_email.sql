-- supabase/migrations/009_representatives_email.sql
-- Add email field to representatives table

alter table representatives
  add column if not exists email text;
