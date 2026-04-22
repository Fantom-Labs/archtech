"use client";

import {
  DndContext,
  PointerSensor,
  closestCorners,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { KanbanColumnView } from "./KanbanColumn";
import { CardModal } from "./CardModal";
import type { KanbanCardRow, KanbanColumnRow } from "@/types/app.types";

type ColumnWithCards = KanbanColumnRow & { kanban_cards: KanbanCardRow[] };

export function KanbanBoard({
  projectId,
  projectName,
  initialColumns,
}: {
  projectId: string;
  projectName: string;
  initialColumns: ColumnWithCards[];
}) {
  const [columns, setColumns] = useState<ColumnWithCards[]>(initialColumns);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [editing, setEditing] = useState<KanbanCardRow | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const reload = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/kanban/columns`);
    const j = (await res.json()) as { columns?: ColumnWithCards[] };
    if (j.columns) setColumns(j.columns);
  }, [projectId]);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    const channel = supabase
      .channel(`kanban-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "kanban_cards",
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          void reload();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [projectId, reload]);

  const columnById = useMemo(() => {
    const m = new Map<string, ColumnWithCards>();
    columns.forEach((c) => m.set(c.id, c));
    return m;
  }, [columns]);

  function findCard(cardId: string): { column: ColumnWithCards; index: number; card: KanbanCardRow } | null {
    for (const col of columns) {
      const idx = col.kanban_cards.findIndex((c) => c.id === cardId);
      if (idx >= 0) {
        return { column: col, index: idx, card: col.kanban_cards[idx] };
      }
    }
    return null;
  }

  async function persistMove(cardId: string, columnId: string, order: number) {
    const res = await fetch(`/api/projects/${projectId}/kanban/cards`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ card_id: cardId, column_id: columnId, order }),
    });
    if (!res.ok) {
      toast.error("Erro ao mover cartão");
      void reload();
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const from = findCard(activeId);
    if (!from) return;

    let targetColumnId = columnById.has(overId) ? overId : null;
    let targetIndex: number | null = null;

    if (!targetColumnId) {
      const to = findCard(overId);
      if (to) {
        targetColumnId = to.column.id;
        targetIndex = to.index;
      }
    }

    if (!targetColumnId) return;

    const sourceCol = from.column;
    const destCol = columnById.get(targetColumnId);
    if (!destCol) return;

    if (sourceCol.id === destCol.id) {
      const oldIndex = from.index;
      let newIndex = destCol.kanban_cards.findIndex((c) => c.id === overId);
      if (newIndex < 0) {
        newIndex = Math.max(0, destCol.kanban_cards.length - 1);
      }
      if (oldIndex === newIndex) return;
      const nextCards = arrayMove(destCol.kanban_cards, oldIndex, newIndex).map((c, i) => ({
        ...c,
        order: i,
      }));
      setColumns((cols) =>
        cols.map((c) => (c.id === destCol.id ? { ...c, kanban_cards: nextCards } : c)),
      );
      for (let i = 0; i < nextCards.length; i++) {
        void persistMove(nextCards[i].id, destCol.id, i);
      }
      return;
    }

    const moving = from.card;
    const sourceCards = sourceCol.kanban_cards.filter((c) => c.id !== moving.id);
    let insertIndex = destCol.kanban_cards.findIndex((c) => c.id === overId);
    if (insertIndex < 0) insertIndex = destCol.kanban_cards.length;
    const destCards = [...destCol.kanban_cards];
    destCards.splice(insertIndex, 0, { ...moving, column_id: destCol.id });

    const nextSource = sourceCards.map((c, i) => ({ ...c, order: i }));
    const nextDest = destCards.map((c, i) => ({ ...c, column_id: destCol.id, order: i }));

    setColumns((cols) =>
      cols.map((c) => {
        if (c.id === sourceCol.id) return { ...c, kanban_cards: nextSource };
        if (c.id === destCol.id) return { ...c, kanban_cards: nextDest };
        return c;
      }),
    );

    for (let i = 0; i < nextSource.length; i++) {
      void persistMove(nextSource[i].id, sourceCol.id, i);
    }
    for (let i = 0; i < nextDest.length; i++) {
      void persistMove(nextDest[i].id, destCol.id, i);
    }
  }

  function openNew(columnId: string) {
    setActiveColumnId(columnId);
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(card: KanbanCardRow) {
    setActiveColumnId(card.column_id);
    setEditing(card);
    setModalOpen(true);
  }

  const completedName = (name: string) => name.toLowerCase().includes("conclu");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="font-headline text-lg font-bold text-on-surface">{projectName}</span>
        <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" aria-hidden />
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col, idx) => (
            <KanbanColumnView
              key={col.id}
              id={col.id}
              name={col.name}
              count={col.kanban_cards.length}
              cards={col.kanban_cards}
              completedColumn={completedName(col.name)}
              onAddCard={() => openNew(col.id)}
              onCardClick={openEdit}
              countVariant={idx === 0 ? "neutral" : idx === 1 ? "primary" : idx === 2 ? "green" : "neutral"}
            />
          ))}
        </div>
      </DndContext>
      <div className="flex h-10 items-center gap-2 text-xs text-on-surface-variant">
        <span className="h-2 w-2 rounded-full bg-primary" />
        Sincronizado com o servidor
      </div>
      <CardModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        projectId={projectId}
        columnId={activeColumnId}
        card={editing}
        onSaved={() => void reload()}
      />
    </div>
  );
}
