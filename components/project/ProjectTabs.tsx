"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const tabs = (projectId: string) =>
  [
    { href: `/dashboard/projects/${projectId}`, label: "Visão geral" },
    { href: `/dashboard/projects/${projectId}/phases`, label: "Fases" },
    { href: `/dashboard/projects/${projectId}/files`, label: "Arquivos" },
    { href: `/dashboard/projects/${projectId}/kanban`, label: "Kanban" },
    { href: `/dashboard/projects/${projectId}/portal`, label: "Portal" },
  ] as const;

export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const items = tabs(projectId);

  return (
    <nav className="mt-6 flex flex-wrap gap-2 border-b border-outline-variant/15 pb-2">
      {items.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-white text-primary shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
