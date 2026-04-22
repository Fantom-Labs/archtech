import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant/30 bg-surface-container-low/40 px-8 py-12 text-center",
        className,
      )}
    >
      {icon ? <div className="mb-4 text-on-surface-variant">{icon}</div> : null}
      <h3 className="font-headline text-lg font-bold text-on-surface">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-on-surface-variant">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
