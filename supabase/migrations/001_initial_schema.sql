-- Extensões
create extension if not exists "pgcrypto";

-- Workspaces
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  plan text not null default 'trial'
    check (plan in ('trial','starter','pro','studio')),
  trial_ends_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  logo_url text,
  portal_primary_color text default '#00535b',
  white_label boolean default false,
  created_at timestamptz default now()
);

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner','admin','member')),
  created_at timestamptz default now(),
  unique(workspace_id, user_id)
);

create table public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  token text unique not null,
  role text not null default 'member',
  accepted_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  slug text not null,
  status text not null default 'active'
    check (status in ('active','paused','completed','archived')),
  description text,
  briefing_json jsonb,
  client_name text,
  client_email text,
  area_m2 numeric,
  location text,
  style text,
  budget_estimated numeric,
  start_date date,
  end_date date,
  cover_image_url text,
  created_at timestamptz default now(),
  unique(workspace_id, slug)
);

create table public.project_phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  status text not null default 'pending'
    check (status in ('pending','active','completed')),
  "order" integer not null,
  start_date date,
  end_date date,
  description text,
  visible_in_portal boolean default true,
  created_at timestamptz default now()
);

create table public.kanban_columns (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  "order" integer not null,
  created_at timestamptz default now()
);

create table public.kanban_cards (
  id uuid primary key default gen_random_uuid(),
  column_id uuid not null references public.kanban_columns(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  assignee_id uuid references auth.users(id),
  due_date date,
  tags text[] default '{}',
  priority text default 'normal'
    check (priority in ('low','normal','high','urgent')),
  "order" integer not null,
  created_at timestamptz default now()
);

create table public.drive_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  drive_file_id text not null,
  name text not null,
  mime_type text,
  visible_in_portal boolean default false,
  added_by uuid references auth.users(id),
  synced_at timestamptz default now(),
  created_at timestamptz default now()
);

create table public.project_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  token text unique not null,
  active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create table public.drive_tokens (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces(id) on delete cascade,
  access_token_encrypted text not null,
  refresh_token_encrypted text not null,
  expires_at timestamptz,
  updated_at timestamptz default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  sender_id uuid references auth.users(id),
  content text,
  file_url text,
  file_name text,
  file_size_bytes integer,
  created_at timestamptz default now()
);

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  all_day boolean default false,
  category text not null default 'work'
    check (category in ('personal','work','project')),
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create index idx_workspace_members_user on public.workspace_members(user_id);
create index idx_workspace_members_ws on public.workspace_members(workspace_id);
create index idx_projects_workspace on public.projects(workspace_id);
create index idx_project_phases_project on public.project_phases(project_id);
create index idx_kanban_columns_project on public.kanban_columns(project_id);
create index idx_kanban_cards_column on public.kanban_cards(column_id);
create index idx_kanban_cards_project on public.kanban_cards(project_id);
create index idx_drive_files_project on public.drive_files(project_id);
create index idx_messages_workspace on public.messages(workspace_id);
create index idx_calendar_events_workspace on public.calendar_events(workspace_id);
