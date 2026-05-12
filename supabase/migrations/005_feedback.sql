-- Migration 005: feedback_submissions table

create table public.feedback_submissions (
  id               bigint       generated always as identity primary key,
  timestamp        timestamptz  not null,
  app_version      text         not null,
  page_route       text         not null,
  account_tier     int2         not null default 0,
  user_role        text         not null default 'none',
  theme            text,
  browser          text,
  os               text,
  screen_size      text,
  session_minutes  int4,
  active_filters   text,
  bills_shown      int4,
  feedback_text    text         not null,
  created_at       timestamptz  not null default now()
);

-- All writes go through the feedback-submit edge function (service_role).
-- No direct anon/authenticated access needed.
alter table public.feedback_submissions enable row level security;

grant all on public.feedback_submissions to service_role;
