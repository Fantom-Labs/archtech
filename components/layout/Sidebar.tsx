"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const nav = [
  { href: "/dashboard", label: "Projetos", icon: "folder_open" },
  { href: "/calendar", label: "Agenda", icon: "event" },
  { href: "/chat", label: "Chat", icon: "chat" },
  { href: "/settings", label: "Ajustes", icon: "tune" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-[#e6e5f4]/60 bg-surface-container-low py-6 pr-3 pl-3">
      <Link href="/dashboard" className="mb-6 flex items-center gap-3 px-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
          {/* Branco no fundo verde-escuro: SVG com fill sólido */}
          <img
            src="/Compass.svg"
            alt=""
            width={18}
            height={29}
            className="h-6 w-auto [filter:brightness(0)_invert(1)]"
          />
        </span>
        <span className="font-headline leading-tight text-on-surface">
          <span className="block text-lg font-extrabold tracking-tight">ArqTech</span>
          <span className="block text-xs font-semibold text-on-surface-variant/90">PRO</span>
        </span>
      </Link>

      <Link
        href="/dashboard/projects/new"
        className="mb-6 flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-center text-sm font-bold text-on-primary shadow-sm transition-opacity hover:opacity-95"
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
        Novo Projeto
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-surface-container-lowest font-semibold text-primary shadow-[0_4px_10px_rgba(0,0,0,0.05)]"
                  : "text-on-surface-variant hover:bg-surface-container-lowest/60 hover:text-primary/90",
              )}
            >
              <span
                className={cn(
                  "material-symbols-outlined text-[22px]",
                  active && "filled",
                )}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-2">
        <Link
          href="/settings/general"
          className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-lowest/60 hover:text-primary/90"
        >
          <span className="material-symbols-outlined text-[22px]">help</span>
          Ajuda
        </Link>
      </div>
    </aside>
  );
}
