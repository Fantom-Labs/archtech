"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import type { ProjectPhaseRow } from "@/types/app.types";

function phaseVariant(status: ProjectPhaseRow["status"]) {
  if (status === "completed") return "completed" as const;
  if (status === "active") return "inProgress" as const;
  return "pending" as const;
}

function SortablePhase({
  phase,
  projectId,
  onRefresh,
}: {
  phase: ProjectPhaseRow;
  projectId: string;
  onRefresh: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: phase.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  async function setStatus(status: ProjectPhaseRow["status"]) {
    const res = await fetch(`/api/projects/${projectId}/phases/${phase.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error("Erro ao atualizar fase");
      return;
    }
    onRefresh();
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-center gap-4 rounded-xl border border-transparent p-4 transition-all ${
        phase.status === "active"
          ? "bg-surface-container-lowest shadow-sm ring-2 ring-primary/20"
          : "bg-surface-container-low/50 hover:bg-surface-container-low"
      } ${isDragging ? "opacity-80" : ""}`}
    >
      <button
        type="button"
        className="cursor-grab text-on-surface-variant active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Reordenar fase"
      >
        <span className="material-symbols-outlined">drag_indicator</span>
      </button>
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-headline font-semibold text-on-surface">{phase.name}</p>
          {phase.description ? (
            <p className="text-sm text-on-surface-variant">{phase.description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={phaseVariant(phase.status)}>
            {phase.status === "pending"
              ? "Pendente"
              : phase.status === "active"
                ? "Em andamento"
                : "Finalizado"}
          </Badge>
          <Button type="button" size="sm" variant="ghost" onClick={() => void setStatus("pending")}>
            Pendente
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => void setStatus("active")}>
            Ativa
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => void setStatus("completed")}>
            Concluir
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PhaseTimeline({
  projectId,
  initialPhases,
}: {
  projectId: string;
  initialPhases: ProjectPhaseRow[];
}) {
  const [phases, setPhases] = useState(initialPhases);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function onRefresh() {
    void fetch(`/api/projects/${projectId}/phases`)
      .then((r) => r.json())
      .then((j: { phases?: ProjectPhaseRow[] }) => {
        if (j.phases) setPhases(j.phases);
      });
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = phases.findIndex((p) => p.id === active.id);
    const newIndex = phases.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(phases, oldIndex, newIndex);
    setPhases(next);
    const res = await fetch(`/api/projects/${projectId}/phases`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: next.map((p) => p.id) }),
    });
    if (!res.ok) {
      toast.error("Erro ao reordenar");
      onRefresh();
    }
  }

  async function addPhase() {
    const res = await fetch(`/api/projects/${projectId}/phases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const j = (await res.json()) as { error?: string };
    if (!res.ok) {
      toast.error(j.error ?? "Erro ao adicionar");
      return;
    }
    toast.success("Fase adicionada");
    setOpen(false);
    setName("");
    onRefresh();
  }

  return (
    <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-headline text-lg font-bold text-on-surface">Linha do tempo</h2>
        <Button type="button" size="sm" onClick={() => setOpen(true)}>
          Adicionar fase
        </Button>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={phases.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="relative mt-6 space-y-2">
            {phases.map((p) => (
              <SortablePhase key={p.id} phase={p} projectId={projectId} onRefresh={onRefresh} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Modal open={open} onOpenChange={setOpen} title="Nova fase">
        <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => void addPhase()} disabled={!name.trim()}>
            Adicionar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
