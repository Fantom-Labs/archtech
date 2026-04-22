"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-sm hover:opacity-95",
        secondary:
          "bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim",
        ghost: "bg-transparent text-on-surface hover:bg-surface-container-high",
        destructive: "bg-error text-on-error hover:opacity-90",
        outline:
          "border border-outline-variant/40 bg-surface-container-lowest text-on-surface hover:border-primary/30 hover:bg-surface-container-low",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
