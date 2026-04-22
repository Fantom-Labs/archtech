import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tight",
  {
    variants: {
      variant: {
        default: "bg-surface-container-high text-on-surface-variant opacity-60",
        completed: "bg-primary-container text-on-primary-container",
        inProgress: "bg-secondary-container text-on-secondary-container",
        pending: "bg-surface-container-high text-on-surface-variant opacity-60",
        error: "bg-error-container text-on-error-container",
        success: "bg-primary-fixed-dim text-on-primary-fixed",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean;
}

export function Badge({ className, variant, pulse, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {pulse ? (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
        </span>
      ) : null}
      {children}
    </span>
  );
}
