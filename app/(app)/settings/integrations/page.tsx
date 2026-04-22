"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function IntegrationsInner() {
  const sp = useSearchParams();
  const drive = sp.get("drive");

  return (
    <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6">
      <h2 className="font-headline text-lg font-bold">Google Drive</h2>
      <p className="mt-2 text-sm text-on-surface-variant">
        Conecte o Drive do escritório para referenciar arquivos nos projetos.
      </p>
      {drive === "ok" ? (
        <p className="mt-4 text-sm font-semibold text-primary">Conectado</p>
      ) : drive === "error" ? (
        <p className="mt-4 text-sm text-error">Falha na conexão. Tente novamente.</p>
      ) : (
        <p className="mt-4 text-sm text-on-surface-variant">Desconectado</p>
      )}
      <Link href="/api/auth/google-drive/connect" className="mt-4 inline-block">
        <Button type="button">Conectar Google Drive</Button>
      </Link>
    </div>
  );
}

export default function SettingsIntegrationsPage() {
  return (
    <Suspense fallback={null}>
      <IntegrationsInner />
    </Suspense>
  );
}
