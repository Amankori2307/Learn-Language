import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function ContextualHeader({ activeClusterId }: { activeClusterId: number | null }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div>
        <h2 className="text-3xl font-bold">Contextual Learning Mode</h2>
        <p className="mt-1 text-muted-foreground">
          Learn words inside short Source Language context lines, then jump into a focused
          workout.
        </p>
      </div>
      {activeClusterId ? (
        <Link href={`/quiz?mode=complex_workout&clusterId=${activeClusterId}`}>
          <Button className="w-full gap-2 sm:w-auto">
            Start Context Workout <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      ) : null}
    </div>
  );
}

export function ContextualClusterSelector({
  activeClusterId,
  clusters,
  setSelectedClusterId,
}: {
  activeClusterId: number | null;
  clusters: Array<{ id: number; name: string }>;
  setSelectedClusterId: (id: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4">
      <label className="text-sm font-medium text-muted-foreground">Choose Context Cluster</label>
      <select
        className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        value={activeClusterId ?? ""}
        onChange={(e) => setSelectedClusterId(Number(e.target.value))}
      >
        {clusters.map((cluster) => (
          <option key={cluster.id} value={cluster.id}>
            {cluster.name}
          </option>
        ))}
      </select>
    </div>
  );
}
