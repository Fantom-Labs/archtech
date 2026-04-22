"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SettingsPortalPage() {
  const [color, setColor] = useState("#00535b");
  const [plan, setPlan] = useState<string>("trial");

  useEffect(() => {
    void fetch("/api/workspace")
      .then((r) => r.json())
      .then((j: { workspace?: { portal_primary_color?: string | null; plan?: string } }) => {
        if (j.workspace?.portal_primary_color) setColor(j.workspace.portal_primary_color);
        if (j.workspace?.plan) setPlan(j.workspace.plan);
      });
  }, []);

  const locked = plan === "trial" || plan === "starter";

  async function save() {
    if (locked) {
      toast.error("Disponível nos planos Pro e Studio");
      return;
    }
    const res = await fetch("/api/workspace", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portal_primary_color: color }),
    });
    if (!res.ok) {
      toast.error("Erro ao salvar");
      return;
    }
    toast.success("Portal atualizado");
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6">
      <h2 className="font-headline text-lg font-bold">Personalização do portal</h2>
      <p className="text-sm text-on-surface-variant">
        Cor primária exibida no portal público do cliente (Pro e Studio).
      </p>
      <Input
        type="color"
        label="Cor primária"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        disabled={locked}
      />
      <Button type="button" disabled={locked} onClick={() => void save()}>
        Salvar
      </Button>
    </div>
  );
}
