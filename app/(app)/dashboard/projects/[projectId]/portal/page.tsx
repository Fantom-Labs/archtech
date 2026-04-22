import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PortalControls } from "@/components/project/PortalControls";
import { getUserWorkspace } from "@/lib/workspace/get-user-workspace";

export default async function ProjectPortalSettingsPage({
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
    .select("id, slug, name")
    .eq("id", projectId)
    .eq("workspace_id", ctx.workspace.id)
    .maybeSingle();

  const project = projectData as unknown as { id: string; slug: string; name: string } | null;

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h2 className="font-headline text-lg font-bold text-on-surface">Portal do cliente</h2>
        <p className="text-sm text-on-surface-variant">
          Gere e gerencie o link público. Ajuste a visibilidade de fases e arquivos nas abas
          correspondentes.
        </p>
      </div>
      <PortalControls projectId={project.id} projectSlug={project.slug} />
    </div>
  );
}
