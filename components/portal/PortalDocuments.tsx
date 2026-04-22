import type { Database } from "@/types/database.types";

type FileRow = Pick<
  Database["public"]["Tables"]["drive_files"]["Row"],
  "id" | "name" | "mime_type" | "drive_file_id" | "synced_at"
>;

export function PortalDocuments({ files }: { files: FileRow[] }) {
  return (
    <section className="rounded-2xl border border-outline-variant/15 p-6 shadow-sm">
      <h2 className="font-headline text-lg font-bold">Documentos</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {files.length === 0 ? (
          <p className="text-sm text-on-surface-variant">Nenhum documento público.</p>
        ) : (
          files.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-outline-variant/20 p-4"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">description</span>
                <div>
                  <p className="text-sm font-semibold">{f.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {new Date(f.synced_at).toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                    })}
                  </p>
                </div>
              </div>
              <a
                href={`https://drive.google.com/file/d/${f.drive_file_id}/view`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
              >
                Baixar
              </a>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
