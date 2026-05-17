alter table accounts
  add column if not exists reset_token            text,
  add column if not exists reset_token_expires_at  timestamptz;

create unique index if not exists accounts_reset_token_idx
  on accounts (reset_token)
  where reset_token is not null;
