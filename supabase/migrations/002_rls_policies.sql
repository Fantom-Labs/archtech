-- Habilitar RLS
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invites enable row level security;
alter table public.projects enable row level security;
alter table public.project_phases enable row level security;
alter table public.kanban_columns enable row level security;
alter table public.kanban_cards enable row level security;
alter table public.drive_files enable row level security;
alter table public.project_links enable row level security;
alter table public.messages enable row level security;
alter table public.calendar_events enable row level security;
alter table public.drive_tokens enable row level security;

-- Helper: workspaces do usuário
-- workspaces: leitura para membros
create policy "workspace_select_member"
  on public.workspaces for select
  using (
    id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );

-- Apenas owner pode atualizar workspace (ajuste: admin também para billing)
create policy "workspace_update_owner_admin"
  on public.workspaces for update
  using (
    id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role in ('owner','admin')
    )
  );

-- workspace_members
create policy "wm_select_same_workspace"
  on public.workspace_members for select
  using (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );

create policy "wm_insert_owner_admin"
  on public.workspace_members for insert
  with check (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role in ('owner','admin')
    )
  );

create policy "wm_delete_owner_admin"
  on public.workspace_members for delete
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role in ('owner','admin')
    )
  );

-- invites: owner/admin
create policy "invites_select"
  on public.workspace_invites for select
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role in ('owner','admin')
    )
  );

create policy "invites_all_admin"
  on public.workspace_invites for all
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role in ('owner','admin')
    )
  );

-- projects
create policy "projects_select"
  on public.projects for select
  using (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );

create policy "projects_insert"
  on public.projects for insert
  with check (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );

create policy "projects_update"
  on public.projects for update
  using (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );

create policy "projects_delete"
  on public.projects for delete
  using (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );

-- project_phases
create policy "phases_all"
  on public.project_phases for all
  using (
    project_id in (
      select p.id from public.projects p
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where wm.user_id = auth.uid()
    )
  );

-- kanban
create policy "kanban_cols_all"
  on public.kanban_columns for all
  using (
    project_id in (
      select p.id from public.projects p
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where wm.user_id = auth.uid()
    )
  );

create policy "kanban_cards_all"
  on public.kanban_cards for all
  using (
    project_id in (
      select p.id from public.projects p
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where wm.user_id = auth.uid()
    )
  );

-- drive_files
create policy "drive_files_all"
  on public.drive_files for all
  using (
    project_id in (
      select p.id from public.projects p
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where wm.user_id = auth.uid()
    )
  );

-- project_links
create policy "project_links_all"
  on public.project_links for all
  using (
    project_id in (
      select p.id from public.projects p
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where wm.user_id = auth.uid()
    )
  );

-- messages
create policy "messages_all"
  on public.messages for all
  using (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );

-- calendar_events
create policy "calendar_all"
  on public.calendar_events for all
  using (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );

-- drive_tokens: owner/admin apenas
create policy "drive_tokens_admin"
  on public.drive_tokens for all
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role in ('owner','admin')
    )
  );
