export function ReviewAccessState() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
      <h1 className="text-2xl font-bold">Review Access Required</h1>
      <p className="mt-2 text-muted-foreground">
        Only reviewer/admin roles can access vocabulary review tools.
      </p>
    </div>
  );
}
