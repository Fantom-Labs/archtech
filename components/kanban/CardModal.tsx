"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import type { KanbanCardRow } from "@/types/app.types";

const priorities = [
  { value: "low", label: "Baixa" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
] as const;

export function CardModal({
  open,
  onOpenChange,
  projectId,
  columnId,
  card,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  projectId: string;
  columnId: string | null;
  card: KanbanCardRow | null;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");
  const [priority, setPriority] = useState<(typeof priorities)[number]["value"]>("normal");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description ?? "");
      setDueDate(card.due_date ?? "");
      setTags((card.tags ?? []).join(", "));
      setPriority(card.priority);
    } else {
      setTitle("");
      setDescription("");
      setDueDate("");
      setTags("");
      setPriority("normal");
    }
  }, [card, open]);

  async function save() {
    if (!columnId && !card) return;
    setLoading(true);
    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (card) {
        const res = await fetch(`/api/projects/${projectId}/kanban/cards/${card.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description: description || null,
            due_date: dueDate || null,
            tags: tagList,
            priority,
          }),
        });
        if (!res.ok) {
          toast.error("Erro ao salvar");
          return;
        }
        toast.success("Tarefa atualizada");
      } else {
        const res = await fetch(`/api/projects/${projectId}/kanban/cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            column_id: columnId,
            title,
            description: description || undefined,
            due_date: dueDate || null,
            tags: tagList,
            priority,
          }),
        });
        if (!res.ok) {
          const j = (await res.json()) as { error?: string };
          toast.error(j.error ?? "Erro ao criar");
          return;
        }
        toast.success("Tarefa criada");
      }
      onOpenChange(false);
      onSaved();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={card ? "Editar tarefa" : "Nova tarefa"}
      description="Defina título, prazo, tags e prioridade."
    >
      <div className="space-y-3">
        <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <div>
          <label className="text-sm font-medium text-on-surface-variant">Descrição</label>
          <textarea
            className="mt-1 w-full rounded-lg border border-transparent bg-surface-container-high px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <Input
          label="Responsável (ID — opcional)"
          placeholder="UUID do usuário"
          disabled
          className="opacity-60"
        />
        <Input
          type="date"
          label="Prazo"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <Input
          label="Tags (separadas por vírgula)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <div>
          <label className="text-sm font-medium text-on-surface-variant">Prioridade</label>
          <select
            className="mt-1 w-full rounded-lg border border-transparent bg-surface-container-high px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            value={priority}
            onChange={(e) => setPriority(e.target.value as (typeof priorities)[number]["value"])}
          >
            {priorities.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" disabled={loading || !title.trim()} onClick={() => void save()}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
