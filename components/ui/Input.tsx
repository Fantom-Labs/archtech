import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export function Input({ className, error, label, id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <div className="w-full space-y-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-on-surface-variant"
        >
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-lg border border-transparent bg-surface-container-high px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/60",
          "focus:border-primary/20 focus:ring-2 focus:ring-primary focus:outline-none",
          error && "ring-2 ring-error/40",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs text-error">{error}</p> : null}
    </div>
  );
}
