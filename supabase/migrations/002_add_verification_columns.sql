-- ============================================================
-- LawTracker — add verification + pull-tracking columns
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

alter table bills
  add column if not exists verified        boolean     not null default false,
  add column if not exists verified_by     text,
  add column if not exists verified_at     timestamptz,
  add column if not exists last_pulled_at  timestamptz,
  add column if not exists pull_source     text,
  add column if not exists raw_pull_data   jsonb,
  add column if not exists pending_changes jsonb,
  add column if not exists source_url      text,
  add column if not exists notes           text;
