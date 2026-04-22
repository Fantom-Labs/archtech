import { cn } from "@/lib/utils/cn";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconWrapperClassName?: string;
  topRightBadge?: string;
  topRightBadgeClassName?: string;
  showAvatarStack?: boolean;
  padValue?: boolean;
}

function AvatarStack() {
  return (
    <div className="flex -space-x-2" aria-hidden>
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#c4e8ea] text-xs font-bold text-primary"
        title=""
      >
        S
      </span>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#e8d5c4] text-xs font-bold text-[#6b4a2a]">
        A
      </span>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  icon,
  iconWrapperClassName,
  topRightBadge,
  topRightBadgeClassName,
  showAvatarStack,
  padValue,
}: MetricCardProps) {
  const displayValue =
    padValue && typeof value === "number" ? String(value).padStart(2, "0") : value;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[12px] bg-surface-container-lowest p-5",
        "shadow-[0_4px_10px_rgba(0,0,0,0.05)]",
      )}
    >
      {topRightBadge ? (
        <span
          className={cn(
            "absolute top-3.5 right-4 z-10 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-tight",
            "bg-primary-fixed-dim/35 text-on-primary-fixed-variant",
            topRightBadgeClassName,
          )}
        >
          {topRightBadge}
        </span>
      ) : null}
      {showAvatarStack ? (
        <div className="absolute top-3 right-3.5 z-10">
          <AvatarStack />
        </div>
      ) : null}
      <div
        className={cn(
          "flex items-start gap-4",
          (topRightBadge || showAvatarStack) && "pr-12",
        )}
      >
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
            iconWrapperClassName ?? "bg-primary-fixed-dim/30 text-primary",
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="font-headline text-3xl font-extrabold leading-tight text-on-surface">
            {displayValue}
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">{label}</p>
        </div>
      </div>
    </div>
  );
}
