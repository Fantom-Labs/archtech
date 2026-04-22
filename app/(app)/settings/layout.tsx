"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const tabs = [
  { href: "/settings/general", label: "Geral" },
  { href: "/settings/team", label: "Equipe" },
  { href: "/settings/integrations", label: "Integrações" },
  { href: "/settings/portal", label: "Portal" },
  { href: "/settings/billing", label: "Cobrança" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Configurações</h1>
        <p className="text-sm text-on-surface-variant">Gerencie o workspace e integrações.</p>
      </div>
      <nav className="flex flex-wrap gap-2 border-b border-outline-variant/15 pb-2">
        {tabs.map((t) => {
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
      {children}
    </div>
  );
}
