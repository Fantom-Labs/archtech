"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, clientName: clientName || undefined }),
      });
      const json = (await res.json()) as { error?: string; project?: { id: string } };
      if (!res.ok) {
        toast.error(json.error ?? "Erro ao criar projeto");
        return;
      }
      toast.success("Projeto criado com sucesso");
      if (json.project?.id) {
        router.push(`/dashboard/projects/${json.project.id}`);
      } else {
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-lg">
      <Link href="/dashboard" className="text-sm font-semibold text-primary hover:underline">
        ← Voltar ao painel
      </Link>
      <h1 className="mt-4 font-headline text-2xl font-extrabold text-on-surface">Novo projeto</h1>
      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <Input label="Nome do projeto" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input
          label="Cliente (opcional)"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Criando..." : "Criar projeto"}
        </Button>
      </form>
    </div>
  );
}
