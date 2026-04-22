"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const token = String(params.token ?? "");
  const [loading, setLoading] = useState(false);

  async function accept() {
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Faça login com o e-mail que recebeu o convite.");
        router.push(`/login?next=/invite/${token}`);
        return;
      }
      const res = await fetch("/api/workspace/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(json.error ?? "Não foi possível aceitar o convite");
        return;
      }
      toast.success("Você entrou no workspace");
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dot-grid-bg flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-8 text-center shadow-lg">
        <span className="material-symbols-outlined text-5xl text-primary">mail</span>
        <h1 className="mt-4 font-headline text-2xl font-extrabold text-on-surface">
          Convite para o workspace
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Aceite para acessar o escritório no ArqTech.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button type="button" className="w-full" disabled={loading} onClick={() => void accept()}>
            {loading ? "Processando..." : "Aceitar convite"}
          </Button>
          <Link
            href={`/login?next=/invite/${encodeURIComponent(token)}`}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Entrar com outra conta
          </Link>
        </div>
      </div>
    </div>
  );
}
