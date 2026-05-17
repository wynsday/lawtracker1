-- Bill status per user — synced from client localStorage for server-side notification targeting
create table if not exists bill_user_status (
  user_id    uuid    not null references accounts(id) on delete cascade,
  bill_id    integer not null references bills(id)    on delete cascade,
  status     text    not null check (status in ('alert','watch','archive')),
  updated_at timestamptz not null default now(),
  primary key (user_id, bill_id)
);

-- Alert settings per user — mirror of client AlertConfig for server-side use
create table if not exists user_alert_settings (
  user_id    uuid primary key references accounts(id) on delete cascade,
  settings   jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- In-app notification records
create table if not exists user_notifications (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references accounts(id) on delete cascade,
  bill_id    integer     references bills(id) on delete set null,
  type       text        not null check (type in ('bill_movement','act_now','keyword_match','civic_date')),
  title      text        not null,
  body       text        not null,
  read       boolean     not null default false,
  created_at timestamptz not null default now()
);
create index on user_notifications (user_id, read, created_at desc);

-- Web Push subscriptions (one row per browser/device)
create table if not exists push_subscriptions (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references accounts(id) on delete cascade,
  endpoint   text        not null unique,
  p256dh     text        not null,
  auth_key   text        not null,
  created_at timestamptz not null default now()
);

-- RLS: service_role only (same pattern as accounts)
alter table bill_user_status    enable row level security;
alter table user_alert_settings enable row level security;
alter table user_notifications  enable row level security;
alter table push_subscriptions  enable row level security;

create policy "service_role only" on bill_user_status    using (false) with check (false);
create policy "service_role only" on user_alert_settings using (false) with check (false);
create policy "service_role only" on user_notifications  using (false) with check (false);
create policy "service_role only" on push_subscriptions  using (false) with check (false);

grant all on bill_user_status, user_alert_settings, user_notifications, push_subscriptions to service_role;
