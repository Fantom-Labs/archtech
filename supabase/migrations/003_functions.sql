-- Colunas padrão do Kanban ao criar projeto
create or replace function public.create_default_kanban_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.kanban_columns (project_id, name, "order") values
    (new.id, 'Backlog', 0),
    (new.id, 'Em andamento', 1),
    (new.id, 'Em revisão', 2),
    (new.id, 'Concluído', 3);
  return new;
end;
$$;

drop trigger if exists trg_projects_default_kanban on public.projects;
create trigger trg_projects_default_kanban
  after insert on public.projects
  for each row execute function public.create_default_kanban_columns();
