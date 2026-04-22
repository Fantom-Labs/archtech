"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

const filters = [
  { id: "all", label: "Todos" },
  { id: "projects", label: "Projetos" },
  { id: "clients", label: "Clientes" },
] as const;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [userId, setUserId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return messages;
    if (filter === "projects") return messages.filter((m) => m.project_id);
    return messages.filter((m) => !m.project_id);
  }, [messages, filter]);

  async function load() {
    const res = await fetch("/api/messages");
    const j = (await res.json()) as { messages?: Message[] };
    if (j.messages) setMessages(j.messages);
  }

  useEffect(() => {
    void load();
    void createBrowserSupabaseClient()
      .auth.getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null));
    const supabase = createBrowserSupabaseClient();
    const channel = supabase
      .channel("messages-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  async function send() {
    if (!content.trim()) return;
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      toast.error("Não foi possível enviar");
      return;
    }
    setContent("");
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] gap-0 rounded-xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
      <aside className="hidden w-64 flex-col border-r border-outline-variant/10 bg-[#f4f2ff] p-4 lg:flex">
        <p className="font-headline text-sm font-bold text-on-surface">Workspace</p>
      </aside>
      <div className="flex w-full max-w-md flex-col border-r border-outline-variant/10">
        <div className="p-4">
          <Input placeholder="Buscar conversas..." aria-label="Buscar conversas" />
        </div>
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                filter === f.id ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          <p className="px-2 text-xs text-on-surface-variant">Conversa geral do escritório</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {filtered.map((m) => {
            const mine = m.sender_id === userId;
            return (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-sm ${
                  mine
                    ? "ml-auto rounded-tr-none bg-primary-container/20 text-primary"
                    : "rounded-tl-none border border-outline-variant/10 bg-white"
                }`}
              >
                {m.content}
              </div>
            );
          })}
        </div>
        <div className="border-t border-outline-variant/10 p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Escreva sua mensagem..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <Button type="button" onClick={() => void send()}>
              Enviar
            </Button>
          </div>
        </div>
      </div>
      <aside className="hidden w-80 flex-col border-l border-outline-variant/10 p-4 xl:flex">
        <p className="text-sm font-semibold text-on-surface">Contexto</p>
        <Button type="button" className="mt-auto" variant="secondary">
          Criar tarefa
        </Button>
      </aside>
      <div className="fixed bottom-6 right-6 rounded-full bg-primary-container px-4 py-2 text-xs font-semibold text-primary shadow-lg">
        Conectado ao WhatsApp
      </div>
    </div>
  );
}
