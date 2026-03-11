export function HistorySummaryCards({
  total,
  correct,
  accuracy,
}: {
  total: number;
  correct: number;
  accuracy: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-border/50 bg-card p-4">
        <p className="text-xs text-muted-foreground">Filtered Attempts</p>
        <p className="text-2xl font-semibold">{total}</p>
      </div>
      <div className="rounded-xl border border-border/50 bg-card p-4">
        <p className="text-xs text-muted-foreground">Correct</p>
        <p className="text-2xl font-semibold">{correct}</p>
      </div>
      <div className="rounded-xl border border-border/50 bg-card p-4">
        <p className="text-xs text-muted-foreground">Accuracy</p>
        <p className="text-2xl font-semibold">{accuracy}%</p>
      </div>
    </div>
  );
}
