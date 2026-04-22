import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { ProjectRow } from "@/types/app.types";

const statusMap = {
  active: { label: "Ativo", variant: "inProgress" as const, pulse: true },
  paused: { label: "Pausado", variant: "pending" as const, pulse: false },
  completed: { label: "Concluído", variant: "completed" as const, pulse: false },
  archived: { label: "Arquivado", variant: "default" as const, pulse: false },
};

export function ProjectHeader({ project }: { project: ProjectRow }) {
  const s = statusMap[project.status];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-widest text-on-surface-variant uppercase">
        <Link href="/dashboard" className="hover:text-primary">
          Projetos
        </Link>
        <span>/</span>
        <span className="text-primary">{project.name}</span>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="font-headline text-4xl font-extrabold text-on-surface md:text-5xl">
          {project.name}
        </h1>
        <Badge variant={s.variant} pulse={s.pulse}>
          {s.label}
        </Badge>
      </div>
    </div>
  );
}
