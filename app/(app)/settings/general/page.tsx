"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SettingsGeneralPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/workspace")
      .then((r) => r.json())
      .then((j: { workspace?: { name: string; slug: string } }) => {
        if (j.workspace) {
          setName(j.workspace.name);
          setSlug(j.workspace.slug);
        }
      });
  }, []);

  async function save() {
    setLoading(true);
    try {
      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      if (!res.ok) {
        toast.error("Erro ao salvar");
        return;
      }
      toast.success("Configurações salvas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6">
      <h2 className="font-headline text-lg font-bold">Geral</h2>
      <Input label="Nome do escritório" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
      <p className="text-xs text-on-surface-variant">
        Logo do workspace: envie uma URL pública ou use o portal para personalização (planos Pro e
        Studio).
      </p>
      <Button type="button" disabled={loading} onClick={() => void save()}>
        {loading ? "Salvando..." : "Salvar"}
      </Button>
    </div>
  );
}
