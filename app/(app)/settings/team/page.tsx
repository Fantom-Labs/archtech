"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Member {
  id: string;
  user_id: string;
  role: string;
}

export default function SettingsTeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");

  async function load() {
    const res = await fetch("/api/workspace/members");
    const j = (await res.json()) as { members?: Member[] };
    if (j.members) setMembers(j.members);
  }

  useEffect(() => {
    void load();
  }, []);

  async function invite() {
    const res = await fetch("/api/workspace/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role: "member" }),
    });
    if (!res.ok) {
      toast.error("Erro ao convidar");
      return;
    }
    toast.success("Convite enviado");
    setEmail("");
  }

  function roleLabel(r: string) {
    if (r === "owner") return "Proprietário";
    if (r === "admin") return "Administrador";
    return "Membro";
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6">
        <h2 className="font-headline text-lg font-bold">Convidar por e-mail</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Input
            type="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-w-[240px]"
          />
          <Button type="button" onClick={() => void invite()}>
            Enviar convite
          </Button>
        </div>
      </div>
      <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6">
        <h2 className="font-headline text-lg font-bold">Membros</h2>
        <ul className="mt-4 divide-y divide-outline-variant/15">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between py-3 text-sm">
              <span className="font-mono text-xs text-on-surface-variant">{m.user_id}</span>
              <span className="font-medium">{roleLabel(m.role)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
