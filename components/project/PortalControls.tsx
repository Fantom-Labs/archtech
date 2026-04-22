"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function PortalControls({
  projectId,
  projectSlug,
}: {
  projectId: string;
  projectSlug: string;
}) {
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/link/generate`, { method: "POST" });
      const j = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        toast.error(j.error ?? "Erro ao gerar link");
        return;
      }
      setLink(j.url ?? null);
      toast.success("Link gerado");
    } finally {
      setLoading(false);
    }
  }

  async function revoke() {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/link/revoke`, { method: "POST" });
      if (!res.ok) {
        toast.error("Erro ao revogar");
        return;
      }
      setLink(null);
      toast.success("Link revogado");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  }

  return (
    <Card className="p-4">
      <h2 className="font-headline text-sm font-bold text-on-surface">Portal do cliente</h2>
      <p className="mt-2 text-xs text-on-surface-variant">
        Gere um link público com JWT. O cliente não precisa fazer login.
      </p>
      <div className="mt-4 space-y-3">
        <label className="flex items-center gap-2 text-sm text-on-surface-variant">
          <input type="checkbox" defaultChecked readOnly />
          Slug público:{" "}
          <span className="font-mono text-on-surface">/p/{projectSlug}</span>
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" disabled={loading} onClick={() => void generate()}>
            Gerar link
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={loading} onClick={() => void revoke()}>
            Revogar
          </Button>
          {link ? (
            <Button type="button" size="sm" variant="secondary" onClick={() => void copy()}>
              Copiar link
            </Button>
          ) : null}
        </div>
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 break-all text-xs text-primary hover:underline"
          >
            Abrir portal
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
        ) : (
          <p className="text-xs text-on-surface-variant">Nenhum link ativo.</p>
        )}
      </div>
    </Card>
  );
}
