export function ProfileLoadingCard() {
  return (
    <div className="space-y-6 rounded-2xl border border-border/50 bg-card p-6">
      <div className="flex items-center gap-4 border-b border-border/40 pb-2">
        <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-52 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="h-24 animate-pulse rounded-xl bg-muted" />
      <div className="h-10 w-36 animate-pulse rounded bg-muted" />
    </div>
  );
}
