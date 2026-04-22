"use client";

import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface CalEvent {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  category: string;
  project_id: string | null;
}

export default function CalendarPage() {
  const [cursor, setCursor] = useState(new Date());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  useEffect(() => {
    const from = monthStart.toISOString();
    const to = addMonths(monthEnd, 1).toISOString();
    void fetch(`/api/calendar/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      .then((r) => r.json())
      .then((j: { events?: CalEvent[] }) => {
        if (j.events) setEvents(j.events);
      });
  }, [cursor, monthStart, monthEnd]);

  const eventsByDay = useMemo(() => {
    const m = new Map<string, CalEvent[]>();
    for (const e of events) {
      const d = format(new Date(e.start_at), "yyyy-MM-dd");
      m.set(d, [...(m.get(d) ?? []), e]);
    }
    return m;
  }, [events]);

  async function createEvent() {
    if (!title || !start || !end) return;
    const res = await fetch("/api/calendar/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        start_at: new Date(start).toISOString(),
        end_at: new Date(end).toISOString(),
        category: "work",
      }),
    });
    if (res.ok) {
      setModal(false);
      setTitle("");
      setStart("");
      setEnd("");
      setCursor(new Date(cursor));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-full bg-surface-container-low p-1">
          {(["Dia", "Semana", "Mês"] as const).map((v, i) => (
            <button
              key={v}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                i === 2 ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <Button type="button" onClick={() => setModal(true)}>
          + Novo agendamento
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-4 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4">
          <p className="font-headline text-sm font-bold">
            {format(cursor, "MMMM yyyy", { locale: ptBR })}
          </p>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />{" "}
              <span className="h-2 w-2 rounded-full bg-primary" /> Pessoal
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />{" "}
              <span className="h-2 w-2 rounded-full bg-secondary" /> Trabalho
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />{" "}
              <span className="h-2 w-2 rounded-full bg-tertiary-container" /> Projetos
            </label>
          </div>
          <p className="rounded-lg bg-surface-container-high px-3 py-2 text-xs text-on-surface-variant">
            Sincronizado com Google Calendar
          </p>
        </aside>

        <div className="overflow-x-auto rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4">
          <div className="mb-4 flex items-center justify-between">
            <Button type="button" variant="ghost" size="sm" onClick={() => setCursor(addMonths(cursor, -1))}>
              ←
            </Button>
            <span className="font-headline font-bold capitalize">
              {format(cursor, "MMMM yyyy", { locale: ptBR })}
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={() => setCursor(addMonths(cursor, 1))}>
              →
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-px bg-outline-variant/20">
            {weekDays.map((d) => (
              <div key={d} className="bg-surface-container-lowest px-2 py-2 text-center text-xs font-semibold">
                {d}
              </div>
            ))}
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayEvents = eventsByDay.get(key) ?? [];
              const today = format(new Date(), "yyyy-MM-dd") === key;
              return (
                <div
                  key={key}
                  className={`min-h-[140px] bg-surface-container-lowest p-2 ${
                    today ? "bg-primary/5 ring-1 ring-primary/20" : ""
                  } ${!isSameMonth(day, cursor) ? "opacity-40" : ""}`}
                >
                  <span className="text-xs font-semibold">{format(day, "d")}</span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.map((e) => (
                      <div
                        key={e.id}
                        className="truncate rounded border-l-4 border-l-primary bg-primary px-1 py-0.5 text-[10px] font-medium text-white"
                      >
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Modal open={modal} onOpenChange={setModal} title="Novo agendamento">
        <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input
          type="datetime-local"
          label="Início"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="mt-2"
        />
        <Input
          type="datetime-local"
          label="Fim"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="mt-2"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setModal(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => void createEvent()}>
            Salvar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
