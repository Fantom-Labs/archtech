import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BriefingPanel } from "@/components/project/BriefingPanel";
import { DriveFileList } from "@/components/drive/DriveFileList";
import { PhaseTimeline } from "@/components/project/PhaseTimeline";
import { PortalControls } from "@/components/project/PortalControls";
import { getUserWorkspace } from "@/lib/workspace/get-user-workspace";
import type { ProjectPhaseRow, ProjectRow } from "@/types/app.types";
import type { Database } from "@/types/database.types";

export default async function ProjectOverviewPage({
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
    .select("*")
    .eq("id", projectId)
    .eq("workspace_id", ctx.workspace.id)
    .maybeSingle();

  const project = projectData as unknown as ProjectRow | null;

  if (!project) {
    notFound();
  }

  const { data: phasesData } = await supabase
    .from("project_phases")
    .select("*")
    .eq("project_id", projectId)
    .order("order", { ascending: true });

  const phases = (phasesData ?? []) as unknown as ProjectPhaseRow[];

  const { data: filesData } = await supabase
    .from("drive_files")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  const files = (filesData ?? []) as unknown as Database["public"]["Tables"]["drive_files"]["Row"][];

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-8 lg:col-span-8">
        <BriefingPanel project={project} />
        <PhaseTimeline projectId={projectId} initialPhases={phases ?? []} />
      </div>
      <div className="space-y-6 lg:col-span-4">
        <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4 shadow-sm">
          <h2 className="font-headline text-sm font-bold text-on-surface">Google Drive</h2>
          <DriveFileList projectId={projectId} initialFiles={files ?? []} compact />
        </div>
        <PortalControls projectId={projectId} projectSlug={project.slug} />
      </div>
    </div>
  );
}
