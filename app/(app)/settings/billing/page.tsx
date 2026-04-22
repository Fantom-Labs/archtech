"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";

export default function SettingsBillingPage() {
  const [plan, setPlan] = useState<string>("trial");
  const [prices, setPrices] = useState<{
    starter: string | null;
    pro: string | null;
    studio: string | null;
  }>({ starter: null, pro: null, studio: null });

  useEffect(() => {
    void fetch("/api/workspace")
      .then((r) => r.json())
      .then((j: { workspace?: { plan?: string } }) => {
        if (j.workspace?.plan) setPlan(j.workspace.plan);
      });
    void fetch("/api/billing/prices")
      .then((r) => r.json())
      .then((j: { starter?: string | null; pro?: string | null; studio?: string | null }) => {
        setPrices({
          starter: j.starter ?? null,
          pro: j.pro ?? null,
          studio: j.studio ?? null,
        });
      });
  }, []);

  async function checkout(priceId: string) {
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const j = (await res.json()) as { url?: string; error?: string };
    if (!res.ok) {
      toast.error(j.error ?? "Erro");
      return;
    }
    if (j.url) window.location.href = j.url;
  }

  async function portal() {
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const j = (await res.json()) as { url?: string };
    if (j.url) window.location.href = j.url;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6">
        <p className="text-xs font-bold tracking-wide text-primary uppercase">
          14 dias grátis — sem cartão de crédito
        </p>
        <h2 className="mt-2 font-headline text-xl font-bold">Plano atual: {plan}</h2>
        <Button type="button" variant="secondary" className="mt-4" onClick={() => void portal()}>
          Gerenciar assinatura
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            name: "Starter",
            desc: "Até 5 projetos ativos, 2 usuários — R$ 97/mês",
            price: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
          },
          {
            name: "Pro",
            desc: "Projetos ilimitados, até 10 usuários — R$ 197/mês",
            price: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
          },
          {
            name: "Studio",
            desc: "Ilimitado + white-label no portal — R$ 397/mês",
            price: process.env.NEXT_PUBLIC_STRIPE_STUDIO_PRICE_ID,
          },
        ].map((p) => (
          <div
            key={p.name}
            className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4 shadow-sm"
          >
            <h3 className="font-headline font-bold">{p.name}</h3>
            <p className="mt-2 text-sm text-on-surface-variant">{p.desc}</p>
            <Button
              type="button"
              className="mt-4 w-full"
              variant="outline"
              disabled={!p.price}
              onClick={() => p.price && void checkout(p.price)}
            >
              Fazer upgrade
            </Button>
          </div>
        ))}
      </div>
      <p className="text-xs text-on-surface-variant">
        Configure STRIPE_STARTER_PRICE_ID, STRIPE_PRO_PRICE_ID e STRIPE_STUDIO_PRICE_ID no servidor
        para habilitar checkout.
      </p>
    </div>
  );
}
