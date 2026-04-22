"use client";

import { useState } from "react";
import Link from "next/link";
import { MetricCard } from "./MetricCard";
import { ProjectCard } from "./ProjectCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils/cn";
import type { ProjectRow } from "@/types/app.types";

type PhaseLite = { id: string; name: string; status: string; order: number };

interface DashboardViewProps {
  projects: (ProjectRow & { project_phases?: PhaseLite[] })[];
  activeCount: number;
  newProjectsThisMonth: number;
  tasksToday: number;
  pendingApprovals: number;
}

export function DashboardView({
  projects,
  activeCount,
  newProjectsThisMonth,
  tasksToday,
  pendingApprovals,
}: DashboardViewProps) {
  const [view, setView] = useState<"grid" | "list">("grid");

  const activeProjects = projects.filter((p) => p.status === "active");
  const monthBadge =
    newProjectsThisMonth > 0
      ? `+${newProjectsThisMonth} esse mês`
      : undefined;

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5">
        <MetricCard
          label="Projetos Ativos"
          value={activeCount}
          icon={
            // eslint-disable-next-line @next/next/no-img-element -- static SVG from /public
            <img
              src="/Compass.svg"
              alt=""
              className="h-7 w-auto object-contain"
              width={14}
              height={23}
            />
          }
          iconWrapperClassName="bg-primary-fixed-dim/30 text-primary"
          topRightBadge={monthBadge}
        />
        <MetricCard
          label="Tarefas feitas hoje"
          value={tasksToday}
          icon={
            <span className="material-symbols-outlined text-[24px] text-[#b85c2a]">check_circle</span>
          }
          iconWrapperClassName="bg-[#ffe8d9] text-[#b85c2a]"
          padValue
        />
        <MetricCard
          label="Aprovações pendentes"
          value={pendingApprovals}
          showAvatarStack
          icon={
            <span className="material-symbols-outlined text-[24px] text-[#8a5a2d]">priority_high</span>
          }
          iconWrapperClassName="bg-[#f0e0d0] text-[#8a5a2d]"
          padValue
        />
      </div>

      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
              Projetos ativos
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Gerencie e acompanhe seus projetos em andamento.
            </p>
          </div>
          <div
            className="inline-flex h-10 items-center overflow-hidden rounded-[10px] border border-outline-variant/20 bg-surface-container-low/80 p-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            role="group"
            aria-label="Modo de visualização"
          >
            <button
              type="button"
              onClick={() => setView("grid")}
              className={cn(
                "inline-flex h-8 w-9 items-center justify-center rounded-md transition",
                view === "grid" ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant",
              )}
              aria-pressed={view === "grid"}
            >
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={cn(
                "inline-flex h-8 w-9 items-center justify-center rounded-md transition",
                view === "list" ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant",
              )}
              aria-pressed={view === "list"}
            >
              <span className="material-symbols-outlined text-[20px]">view_list</span>
            </button>
          </div>
        </div>

        <div className="mt-6 md:mt-8">
          {activeProjects.length === 0 ? (
            <EmptyState
              title="Nenhum projeto ativo"
              description="Crie um novo projeto e comece a acompanhar o andamento do escritório."
              action={
                <Link
                  href="/dashboard/projects/new"
                  className="inline-flex min-h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-on-primary shadow-sm"
                >
                  Criar projeto
                </Link>
              }
            />
          ) : view === "grid" ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {activeProjects.map((p) => (
                <ProjectCard key={p.id} project={p} layout="grid" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {activeProjects.map((p) => (
                <ProjectCard key={p.id} project={p} layout="list" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
