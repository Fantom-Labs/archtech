import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PhaseTimeline } from "@/components/project/PhaseTimeline";
import { getUserWorkspace } from "@/lib/workspace/get-user-workspace";

export default async function ProjectPhasesPage({
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
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("workspace_id", ctx.workspace.id)
    .maybeSingle();

  if (!project) {
    notFound();
  }

  const { data: phases } = await supabase
    .from("project_phases")
    .select("*")
    .eq("project_id", projectId)
    .order("order", { ascending: true });

  return <PhaseTimeline projectId={projectId} initialPhases={phases ?? []} />;
}
