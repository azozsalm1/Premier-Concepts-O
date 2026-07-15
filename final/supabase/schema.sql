create table if not exists projects (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users not null,
 name text not null,
 status text,
 address text,
 payload jsonb not null default '{}'::jsonb,
 created_at timestamptz default now(),
 updated_at timestamptz default now()
);
alter table projects enable row level security;
create policy "users manage own projects" on projects
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists app_backups (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users not null,
 payload jsonb not null,
 created_at timestamptz default now()
);
alter table app_backups enable row level security;
create policy "users manage own backups" on app_backups
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
