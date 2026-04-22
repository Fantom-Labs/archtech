"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils/cn";
import type { KanbanCardRow } from "@/types/app.types";

const priorityLabels = {
  low: "Baixa",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
} as const;

const tagColors = [
  "bg-primary-container/25 text-primary",
  "bg-secondary-container/40 text-on-secondary-container",
  "bg-tertiary-container/30 text-on-tertiary-container",
];

export function KanbanSortableCard({
  card,
  onOpen,
  completedColumn,
}: {
  card: KanbanCardRow;
  onOpen: () => void;
  completedColumn?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", columnId: card.column_id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const today = format(new Date(), "yyyy-MM-dd");
  const urgentToday = card.priority === "urgent" && card.due_date === today;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("relative", isDragging && "z-20 opacity-90")}
    >
      <div
        className={cn(
          "rounded-xl border border-transparent bg-surface-container-lowest p-4 pl-9 shadow-sm transition-all hover:border-primary/20",
          urgentToday && "border-l-4 border-l-error",
          completedColumn && "opacity-70 grayscale-[0.5]",
        )}
      >
        <button
          type="button"
          className="absolute top-3 left-2 cursor-grab text-on-surface-variant active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Arrastar tarefa"
        >
          <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
        </button>
        <div
          role="button"
          tabIndex={0}
          className="cursor-pointer text-left"
          onClick={onOpen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpen();
            }
          }}
        >
          {card.tags?.[0] ? (
            <span
              className={cn(
                "mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-tight uppercase",
                tagColors[card.tags[0].length % tagColors.length],
              )}
            >
              {card.tags[0]}
            </span>
          ) : null}
          <p
            className={cn(
              "font-headline text-sm leading-snug font-bold text-on-surface",
              completedColumn && "line-through",
            )}
          >
            {card.title}
          </p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-outline-variant/10 bg-surface-container-high text-[10px] font-bold text-on-surface-variant">
              ?
            </div>
            {card.due_date ? (
              <span className="text-[11px] text-on-surface-variant">
                {format(new Date(card.due_date), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[10px] text-on-surface-variant">
            {priorityLabels[card.priority]}
          </p>
        </div>
      </div>
    </div>
  );
}
