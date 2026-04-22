"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(
          error.message === "Invalid login credentials"
            ? "E-mail ou senha inválidos"
            : error.message,
        );
        return;
      }
      toast.success("Login realizado com sucesso");
      router.push(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function signInGoogle() {
    const supabase = createBrowserSupabaseClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
  }

  return (
    <div className="dot-grid-bg relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary">
            <span className="material-symbols-outlined text-[22px]">architecture</span>
          </span>
          <span className="font-headline text-lg font-extrabold text-on-surface">ArqTech</span>
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-lg">
          <h1 className="font-headline text-2xl font-extrabold text-on-surface">Entrar</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Acesse o painel do seu escritório.
          </p>
          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <Input
              type="email"
              name="email"
              label="E-mail"
              placeholder="voce@escritorio.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              type="password"
              name="password"
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider text-on-surface-variant">
              <span className="bg-surface-container-lowest px-2">ou</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full border-outline-variant/30 bg-surface-container-lowest"
            onClick={() => void signInGoogle()}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar com Google
          </Button>
          <p className="mt-8 text-center text-sm text-on-surface-variant">
            Não tem conta?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>

      <footer className="border-t border-outline-variant/10 bg-[#f4f2ff] px-6 py-6 text-center text-xs text-on-surface-variant">
        <p>© {new Date().getFullYear()} ArqTech. Todos os direitos reservados.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="#" className="hover:text-primary">
            Privacidade
          </Link>
          <Link href="#" className="hover:text-primary">
            Termos
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface">
          <Spinner />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
