import Link from "next/link";

export function PortalHeader({ workspaceName }: { workspaceName: string }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-outline-variant/10 bg-white/70 px-6 py-4 backdrop-blur-xl">
      <Link href="#" className="flex items-center gap-2 font-headline font-extrabold text-primary">
        <span className="material-symbols-outlined">architecture</span>
        {workspaceName}
      </Link>
      <nav className="hidden items-center gap-6 text-sm font-medium text-on-surface-variant md:flex">
        <span>Visão geral</span>
        <span>Fases</span>
        <span>Galeria</span>
        <span>Documentos</span>
      </nav>
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
        <div className="h-9 w-9 rounded-full bg-surface-container-high" />
      </div>
    </header>
  );
}
