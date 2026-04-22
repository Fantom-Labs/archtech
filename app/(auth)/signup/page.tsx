"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data.session) {
        const res = await fetch("/api/workspace/bootstrap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceName }),
        });
        const json = (await res.json()) as { error?: string };
        if (!res.ok) {
          toast.error(json.error ?? "Erro ao criar escritório");
          return;
        }
        toast.success("Conta criada com sucesso");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.success("Verifique seu e-mail para confirmar a conta.");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dot-grid-bg flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary">
          <span className="material-symbols-outlined text-[22px]">architecture</span>
        </span>
        <span className="font-headline text-xl font-extrabold text-on-surface">ArqTech</span>
      </div>
      <div className="w-full max-w-md rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-lg">
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Criar conta</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          14 dias grátis — sem cartão de crédito.
        </p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <Input
            label="Nome do escritório"
            name="workspace"
            placeholder="Ex.: Estúdio Silva Arquitetura"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            required
          />
          <Input
            type="email"
            label="E-mail"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            type="password"
            label="Senha"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
