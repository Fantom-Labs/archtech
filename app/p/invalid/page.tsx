import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function PortalInvalidPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 text-center">
      <span className="material-symbols-outlined text-5xl text-error">link_off</span>
      <h1 className="mt-4 font-headline text-2xl font-extrabold text-on-surface">
        Link inválido ou expirado
      </h1>
      <p className="mt-2 max-w-md text-sm text-on-surface-variant">
        Solicite um novo link ao escritório de arquitetura.
      </p>
      <Link href="/" className="mt-8">
        <Button type="button" variant="outline">
          Ir para o site
        </Button>
      </Link>
    </div>
  );
}
