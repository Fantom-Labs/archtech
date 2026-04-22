"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/Button";
import { KanbanSortableCard } from "./KanbanCard";
import type { KanbanCardRow } from "@/types/app.types";

export function KanbanColumnView({
  id,
  name,
  count,
  cards,
  completedColumn,
  onAddCard,
  onCardClick,
  countVariant,
}: {
  id: string;
  name: string;
  count: number;
  cards: KanbanCardRow[];
  completedColumn?: boolean;
  onAddCard: () => void;
  onCardClick: (c: KanbanCardRow) => void;
  countVariant: "neutral" | "primary" | "green";
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const badge =
    countVariant === "primary"
      ? "bg-primary-container text-on-primary"
      : countVariant === "green"
        ? "bg-primary/15 text-primary"
        : "bg-surface-container-high text-on-surface-variant";

  return (
    <div
      ref={setNodeRef}
      className={`flex h-full min-h-[320px] w-72 flex-col rounded-xl border border-outline-variant/5 bg-surface-container-low/50 p-3 ${
        isOver ? "ring-2 ring-primary/20" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-headline text-sm font-bold text-on-surface">{name}</h3>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge}`}>{count}</span>
      </div>
      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-2">
          {cards.map((c) => (
            <KanbanSortableCard
              key={c.id}
              card={c}
              completedColumn={completedColumn}
              onOpen={() => onCardClick(c)}
            />
          ))}
        </div>
      </SortableContext>
      <div className="mt-2 border-t border-outline-variant/10 pt-2">
        {cards.length === 0 ? (
          <div className="rounded-lg border border-dashed border-outline-variant/25 p-4 text-center">
            <p className="text-xs text-on-surface-variant">Nenhuma tarefa aqui</p>
            <Button type="button" size="sm" variant="ghost" className="mt-2" onClick={onAddCard}>
              + Adicionar tarefa
            </Button>
          </div>
        ) : (
          <Button type="button" size="sm" variant="ghost" className="w-full" onClick={onAddCard}>
            + Adicionar tarefa
          </Button>
        )}
      </div>
    </div>
  );
}
