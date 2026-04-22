"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function CompleteWorkspaceForm() {
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/workspace/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceName }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(json.error ?? "Erro ao criar escritório");
        return;
      }
      toast.success("Escritório criado com sucesso");
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-lg">
      <h1 className="font-headline text-2xl font-extrabold text-on-surface">
        Nome do escritório
      </h1>
      <p className="mt-2 text-sm text-on-surface-variant">
        Para continuar, informe o nome do seu escritório de arquitetura.
      </p>
      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <Input
          label="Nome do escritório"
          required
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          placeholder="Ex.: Estúdio Silva"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Salvando..." : "Continuar"}
        </Button>
      </form>
    </div>
  );
}
