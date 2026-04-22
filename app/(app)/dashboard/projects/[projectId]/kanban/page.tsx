import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { getUserWorkspace } from "@/lib/workspace/get-user-workspace";
import type { KanbanCardRow, KanbanColumnRow } from "@/types/app.types";

export default async function ProjectKanbanPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const ctx = await getUserWorkspace();
  if (!ctx) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const { data: projectData } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", projectId)
    .eq("workspace_id", ctx.workspace.id)
    .maybeSingle();

  const project = projectData as unknown as { id: string; name: string } | null;

  if (!project) {
    notFound();
  }

  const { data: columnsData } = await supabase
    .from("kanban_columns")
    .select("*, kanban_cards(*)")
    .eq("project_id", projectId)
    .order("order", { ascending: true });

  const columns = (columnsData ?? []) as unknown as (KanbanColumnRow & {
    kanban_cards?: KanbanCardRow[];
  })[];

  const normalized =
    columns?.map((col) => ({
      ...col,
      kanban_cards: [...(col.kanban_cards ?? [])].sort((a, b) => a.order - b.order),
    })) ?? [];

  return (
    <KanbanBoard projectId={projectId} projectName={project.name} initialColumns={normalized} />
  );
}
