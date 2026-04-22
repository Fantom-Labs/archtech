"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-headline text-xl font-bold text-on-surface">Algo deu errado</h1>
      <p className="max-w-md text-sm text-on-surface-variant">
        Tente novamente ou volte ao painel.
      </p>
      <div className="flex gap-2">
        <Button type="button" onClick={() => reset()}>
          Tentar de novo
        </Button>
        <Link href="/dashboard">
          <Button type="button" variant="outline">
            Painel
          </Button>
        </Link>
      </div>
    </div>
  );
}
