"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

interface TopHeaderProps {
  title?: string;
  breadcrumb?: { label: string; href?: string }[];
  userEmail?: string | null;
  userName?: string | null;
  userRoleLabel?: string;
  avatarUrl?: string | null;
}

export function TopHeader({
  title,
  breadcrumb,
  userEmail,
  userName,
  userRoleLabel = "Arquiteto",
  avatarUrl,
}: TopHeaderProps) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const initials =
    userName
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ??
    userEmail?.slice(0, 2).toUpperCase() ??
    "AT";

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="fixed top-0 right-0 left-64 z-40 flex h-[72px] items-center border-b border-[#e6e5f4]/50 px-6 md:px-8">
      <div className="absolute inset-0 bg-[#f4f2ff]/85 backdrop-blur-sm" />
      <div className="relative flex w-full max-w-full items-center justify-between gap-4">
        {title || (breadcrumb && breadcrumb.length) ? (
          <div className="hidden min-w-0 sm:block sm:max-w-[28%]">
            {breadcrumb && breadcrumb.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
                {breadcrumb.map((b, i) => (
                  <span key={b.label} className="flex items-center gap-2">
                    {i > 0 ? <span className="text-outline-variant">/</span> : null}
                    {b.href ? (
                      <Link href={b.href} className="hover:text-primary">
                        {b.label}
                      </Link>
                    ) : (
                      <span className="text-primary">{b.label}</span>
                    )}
                  </span>
                ))}
              </div>
            ) : null}
            {title ? <h1 className="font-headline text-base font-bold text-on-surface">{title}</h1> : null}
          </div>
        ) : null}
        <div className="flex min-w-0 flex-1">
          <label className="relative w-full max-w-3xl" htmlFor="dashboard-search">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-on-surface-variant/80">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </span>
            <input
              id="dashboard-search"
              type="search"
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search projects, clients or technical files…"
              className="h-12 w-full rounded-2xl border-0 bg-surface-container-low/90 py-2 pr-3 pl-11 text-sm text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none ring-0 placeholder:text-on-surface-variant/70 focus:ring-2 focus:ring-primary/15"
            />
          </label>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            className="hidden items-center gap-2 rounded-[12px] border border-outline-variant/15 bg-surface-container-lowest px-3.5 py-2 text-sm font-medium text-on-surface shadow-[0_4px_10px_rgba(0,0,0,0.05)] transition hover:bg-surface-container-low sm:flex"
          >
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">filter_list</span>
            Filtros
          </button>
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-[12px] text-on-surface-variant transition hover:bg-surface-container-low"
            aria-label="Notificações"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            <span className="absolute top-2.5 right-2 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>
          <Link
            href="/settings/general"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low md:flex"
            aria-label="Ajuda"
          >
            <span className="material-symbols-outlined text-[24px]">help</span>
          </Link>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="ml-0.5 flex min-w-0 max-w-[200px] items-center gap-2.5 rounded-2xl py-1 pr-1 pl-1.5 text-left transition hover:bg-surface-container-low"
                aria-label="Menu da conta"
              >
                <Avatar className="h-9 w-9 border border-primary/10 shadow-sm">
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
                  <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden min-w-0 sm:block">
                  <span className="block truncate font-headline text-sm font-bold text-primary">
                    {userName ?? "Usuário"}
                  </span>
                  <span className="block truncate text-xs text-on-surface-variant">
                    {userRoleLabel}
                  </span>
                </span>
                <span className="material-symbols-outlined hidden shrink-0 text-on-surface-variant sm:block">
                  expand_more
                </span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-[110] min-w-[200px] rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-2 shadow-lg"
                sideOffset={8}
              >
                <div className="px-2 py-1.5 text-xs text-on-surface-variant">
                  {userEmail}
                </div>
                <DropdownMenu.Separator className="my-1 h-px bg-outline-variant/20" />
                <DropdownMenu.Item asChild>
                  <Link
                    href="/settings"
                    className="flex cursor-pointer rounded-lg px-2 py-2 text-sm outline-none hover:bg-surface-container-low"
                  >
                    Configurações
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-error"
                    type="button"
                    onClick={() => void signOut()}
                  >
                    Sair
                  </Button>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
}
