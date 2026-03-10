import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type SurfaceMessageProps = {
  title: string;
  description: string;
  action?: ReactNode;
  tone?: "default" | "error" | "empty";
  className?: string;
};

const toneStyles = {
  default: {
    icon: Info,
    wrapper: "border-border/50 bg-card text-muted-foreground",
    iconClassName: "text-primary",
  },
  error: {
    icon: AlertTriangle,
    wrapper: "border-red-200 bg-red-50 text-red-700",
    iconClassName: "text-red-600",
  },
  empty: {
    icon: Inbox,
    wrapper: "border-border/50 bg-card text-muted-foreground",
    iconClassName: "text-muted-foreground",
  },
} as const;

export function SurfaceMessage({
  title,
  description,
  action,
  tone = "default",
  className,
}: SurfaceMessageProps) {
  const Icon = toneStyles[tone].icon;

  return (
    <div
      className={cn(
        "rounded-2xl border p-8 text-center",
        toneStyles[tone].wrapper,
        className,
      )}
    >
      <div className="mx-auto flex w-fit items-center justify-center rounded-full bg-background/70 p-3">
        <Icon className={cn("size-5", toneStyles[tone].iconClassName)} />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function CardGridSkeleton({
  cards = 4,
  className,
}: {
  cards?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4", className)}>
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-border/50 bg-card p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-4 h-8 w-16" />
          <Skeleton className="mt-6 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-4 h-9 w-full" />
        </div>
      ))}
    </div>
  );
}

export function TableSurfaceSkeleton({
  rows = 6,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card overflow-hidden", className)}>
      <div
        className="grid gap-3 border-b border-border/50 bg-secondary/30 px-4 py-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-3 w-16" />
        ))}
      </div>
      <div className="divide-y divide-border/40">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-3 px-4 py-4"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <Skeleton
                key={columnIndex}
                className={cn("h-4", columnIndex === 0 ? "w-5/6" : "w-3/4")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card p-5 md:p-6">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-3 h-10 w-56" />
        <Skeleton className="mt-3 h-4 w-2/3" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-12 w-full sm:w-56" />
          <Skeleton className="h-12 w-full sm:w-56" />
        </div>
      </div>

      <CardGridSkeleton />

      <div className="rounded-2xl border border-border/60 bg-card p-5 md:p-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-2 h-4 w-56" />
        <CardGridSkeleton cards={4} className="mt-6" />
      </div>
    </div>
  );
}

export function InlineLoading({
  label = "Loading...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <Loader2 className="size-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}
