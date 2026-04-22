import { cn } from "@/lib/utils/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent",
        className,
      )}
      role="status"
      aria-label="Carregando"
    />
  );
}
