import { cn } from "@/lib/utils/cn";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
