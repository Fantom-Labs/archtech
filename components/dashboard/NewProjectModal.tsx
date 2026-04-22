"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewProjectModal({ open, onOpenChange }: NewProjectModalProps) {
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
      onOpenChange(false);
      setName("");
      setClientName("");
      router.refresh();
      if (json.project?.id) {
        router.push(`/dashboard/projects/${json.project.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Novo projeto"
      description="Crie um projeto e organize fases, arquivos e o portal do cliente."
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Input label="Nome do projeto" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input
          label="Cliente (opcional)"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Criar projeto"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
