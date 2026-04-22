import { redirect } from "next/navigation";
import { getPortalPayload } from "@/lib/portal/get-portal-payload";
import { PortalDocuments } from "@/components/portal/PortalDocuments";
import { PortalGallery } from "@/components/portal/PortalGallery";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalHero } from "@/components/portal/PortalHero";
import { PortalPhaseTimeline } from "@/components/portal/PortalPhaseTimeline";

export default async function PublicPortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectSlug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { projectSlug } = await params;
  const sp = await searchParams;
  const data = await getPortalPayload(projectSlug, sp.token);

  if ("error" in data) {
    redirect("/p/invalid");
  }

  const { project, phases, files, workspace } = data;
  const progress =
    phases.length > 0
      ? Math.round(
          (phases.filter((p) => p.status === "completed").length / phases.length) * 100,
        )
      : 0;

  return (
    <div className="min-h-screen bg-white text-on-surface">
      <PortalHeader workspaceName={workspace?.name ?? "ArqTech"} />
      <PortalHero
        title={project.name}
        coverUrl={project.cover_image_url}
        primaryColor={workspace?.portal_primary_color ?? "#00535b"}
      />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-outline-variant/15 p-6 shadow-sm">
              <h2 className="font-headline text-lg font-bold">Progresso</h2>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: workspace?.portal_primary_color ?? undefined,
                  }}
                />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-on-surface-variant">Cliente</p>
                  <p className="font-medium">{project.client_name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Localização</p>
                  <p className="font-medium">{project.location ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Estilo</p>
                  <p className="font-medium">{project.style ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Metragem</p>
                  <p className="font-medium">
                    {project.area_m2 != null ? `${project.area_m2} m²` : "—"}
                  </p>
                </div>
              </div>
            </section>
            <PortalPhaseTimeline phases={phases} />
            <PortalGallery coverUrl={project.cover_image_url} />
            <PortalDocuments files={files} />
          </div>
          <aside className="rounded-2xl border border-outline-variant/15 bg-surface-container-low/40 p-6 shadow-sm">
            <p className="text-xs font-bold tracking-widest text-primary uppercase">Arquiteto</p>
            <h3 className="mt-2 font-headline text-xl font-bold">{workspace?.name ?? "Escritório"}</h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              Acompanhe o andamento do seu projeto pelo portal exclusivo.
            </p>
          </aside>
        </div>
      </main>
      <footer className="mt-12 bg-[#f4f2ff] px-6 py-10 text-center text-sm text-on-surface-variant">
        <p>© {new Date().getFullYear()} {workspace?.name ?? "ArqTech"}</p>
      </footer>
    </div>
  );
}
