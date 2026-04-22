"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface DriveFileLite {
  id?: string;
  name?: string | null;
  mimeType?: string | null;
}

export function DrivePicker({
  projectId,
  open,
  onOpenChange,
  onAdded,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAdded: () => void;
}) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<DriveFileLite[]>([]);

  async function search() {
    setLoading(true);
    try {
      const res = await fetch(`/api/drive/files?q=${encodeURIComponent(q)}`);
      const j = (await res.json()) as { files?: DriveFileLite[]; error?: string };
      if (!res.ok) {
        toast.error(j.error ?? "Falha ao listar o Drive");
        return;
      }
      setFiles(j.files ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function add(file: DriveFileLite) {
    if (!file.id || !file.name) return;
    const res = await fetch(`/api/projects/${projectId}/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        drive_file_id: file.id,
        name: file.name,
        mime_type: file.mimeType ?? undefined,
      }),
    });
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      toast.error(j.error ?? "Erro ao adicionar");
      return;
    }
    toast.success("Arquivo adicionado ao projeto");
    onAdded();
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Buscar no Google Drive">
      <div className="flex gap-2">
        <Input
          placeholder="Nome do arquivo..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button type="button" onClick={() => void search()} disabled={loading}>
          {loading ? "..." : "Buscar"}
        </Button>
      </div>
      <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
        {files.map((f) => (
          <li
            key={f.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-outline-variant/15 p-2 text-sm"
          >
            <span className="truncate">{f.name}</span>
            <Button type="button" size="sm" variant="secondary" onClick={() => void add(f)}>
              Adicionar
            </Button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
