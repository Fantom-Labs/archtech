import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { ProjectTabs } from "@/components/project/ProjectTabs";
import { getUserWorkspace } from "@/lib/workspace/get-user-workspace";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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
    .select("*")
    .eq("id", projectId)
    .eq("workspace_id", ctx.workspace.id)
    .maybeSingle();

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-2">
      <ProjectHeader project={project} />
      <ProjectTabs projectId={projectId} />
      <div className="pt-6">{children}</div>
    </div>
  );
}
