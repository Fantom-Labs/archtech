import type { Database } from "@/types/database.types";

type Phase = Database["public"]["Tables"]["project_phases"]["Row"];

export function PortalPhaseTimeline({ phases }: { phases: Phase[] }) {
  return (
    <section className="rounded-2xl border border-outline-variant/15 p-6 shadow-sm">
      <h2 className="font-headline text-lg font-bold">Fases do projeto</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {phases.map((p) => {
          const completed = p.status === "completed";
          const active = p.status === "active";
          return (
            <div
              key={p.id}
              className={`rounded-xl border-l-4 bg-surface-container-low/40 p-4 ${
                completed
                  ? "border-primary"
                  : active
                    ? "z-10 scale-105 border-secondary shadow-lg"
                    : "border-outline-variant opacity-60"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`material-symbols-outlined ${completed ? "filled text-primary" : active ? "text-secondary" : ""}`}
                >
                  {completed ? "check_circle" : active ? "schedule" : "radio_button_unchecked"}
                </span>
                <p className="font-headline text-sm font-bold">{p.name}</p>
              </div>
              {p.description ? (
                <p className="mt-2 text-xs text-on-surface-variant">{p.description}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
