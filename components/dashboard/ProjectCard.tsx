"use client";

import { format, differenceInCalendarDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { ProjectRow } from "@/types/app.types";

type PhaseLite = { id: string; name: string; status: string; order: number };

export interface ProjectCardProps {
  project: ProjectRow & { project_phases?: PhaseLite[] };
  layout?: "grid" | "list";
}

function phaseContext(phases: PhaseLite[] | undefined) {
  if (!phases?.length) {
    return { label: "BRIEFING", badgeClass: "text-amber-800" };
  }
  const active = phases.find((p) => p.status === "active");
  const ordered = [...phases].sort((a, b) => a.order - b.order);
  const current = active ?? ordered[0];
  const name = (current?.name ?? "Briefing").toLowerCase();
  if (name.includes("obra") || name.includes("execução")) {
    return { label: "OBRA", badgeClass: "text-[#0a6b6e]" };
  }
  if (name.includes("execut") || name.includes("detalh")) {
    return { label: "EXECUTIVO", badgeClass: "text-sky-800" };
  }
  if (name.includes("brief") || name.includes("estudo")) {
    return { label: "BRIEFING", badgeClass: "text-amber-800" };
  }
  return {
    label: (current?.name ?? "Fase").slice(0, 10).toUpperCase(),
    badgeClass: "text-slate-700",
  };
}

function progressFromPhases(phases: PhaseLite[] | undefined) {
  if (!phases?.length) return 0;
  const done = phases.filter((p) => p.status === "completed").length;
  return Math.round((done / phases.length) * 100);
}

export function ProjectCard({ project, layout = "grid" }: ProjectCardProps) {
  const router = useRouter();
  const projectHref = `/dashboard/projects/${project.id}`;
  const phases = project.project_phases;
  const progress = progressFromPhases(phases);
  const ctx = phaseContext(phases);
  const end = project.end_date
    ? format(new Date(project.end_date), "d MMM", { locale: ptBR })
    : null;
  const daysLeft = project.end_date
    ? differenceInCalendarDays(new Date(project.end_date), new Date())
    : null;
  const urgent = project.end_date && daysLeft !== null && daysLeft >= 0 && daysLeft <= 5;
  const past = project.end_date && daysLeft !== null && daysLeft < 0;
  const deadlineLabel = end
    ? project.end_date && (urgent || past)
      ? `${end} — Revisão / prazo`
      : `${end} — Prazo`
    : "Sem prazo";

  function onCardOpen() {
    router.push(projectHref);
  }

  const imageBlock = (
    <div
      className={cn(
        "relative overflow-hidden bg-surface-container-high",
        layout === "grid" ? "h-48" : "h-full min-h-[120px] w-44 shrink-0 sm:w-56",
      )}
    >
      {project.cover_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.cover_image_url}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-on-surface-variant/50">
          <span className="material-symbols-outlined text-5xl">image</span>
        </div>
      )}
      <span
        className="absolute top-3 right-3 z-[1] rounded-full border border-white/30 bg-surface-container-lowest/95 px-2.5 py-1 text-[9px] font-extrabold tracking-wider drop-shadow-sm backdrop-blur-sm"
      >
        <span className={ctx.badgeClass}>{ctx.label}</span>
      </span>
    </div>
  );

  const mainBlock = (
    <div className={cn("min-w-0 p-4", layout === "list" && "flex flex-1 flex-col")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-headline text-base font-bold leading-snug text-on-surface">
            {project.name}
          </h3>
          {project.client_name ? (
            <p className="mt-0.5 truncate text-sm text-on-surface-variant">Cliente: {project.client_name}</p>
          ) : (
            <p className="mt-0.5 text-sm text-on-surface-variant/80">Cliente: —</p>
          )}
        </div>
        <button
          type="button"
          className="shrink-0 rounded-md p-1 text-on-surface-variant hover:bg-surface-container-low"
          aria-label="Opções do projeto"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="material-symbols-outlined text-[20px]">more_vert</span>
        </button>
      </div>
      <div className="mt-4">
        <div className="flex items-baseline justify-between text-xs text-on-surface-variant">
          <span>Progresso</span>
          <span className="font-bold text-on-surface">{progress}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-container-high">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div
        className={cn(
          "mt-4 flex items-center justify-between border-t border-outline-variant/20 pt-3",
          layout === "list" && "mt-auto",
        )}
      >
        <span
          className={cn(
            "inline-flex min-w-0 items-center gap-1.5 text-xs",
            past || urgent ? "font-medium text-error" : "text-on-surface-variant",
          )}
        >
          <span className="material-symbols-outlined shrink-0 text-[16px]">calendar_today</span>
          <span className="truncate">{deadlineLabel}</span>
        </span>
        <Link
          href={projectHref}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 text-on-surface-variant transition hover:text-primary"
          aria-label="Abrir em nova aba"
        >
          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
        </Link>
      </div>
    </div>
  );

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={onCardOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCardOpen();
        }
      }}
      className={cn(
        "group cursor-pointer overflow-hidden rounded-[12px] border border-outline-variant/10 bg-surface-container-lowest shadow-[0_4px_10px_rgba(0,0,0,0.05)] transition-shadow duration-200",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20",
        layout === "list" ? "flex flex-col sm:flex-row" : "",
      )}
    >
      {imageBlock}
      {mainBlock}
    </article>
  );
}
