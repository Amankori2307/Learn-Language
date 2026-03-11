import { BookOpen, Hash, Sparkles } from "lucide-react";

export function ClustersHeader({
  isLoading,
  topCluster,
  totalWords,
  nonEmptyClusters,
  totalResults,
}: {
  isLoading: boolean;
  topCluster?: { name: string; wordCount: number } | null;
  totalWords: number;
  nonEmptyClusters: number;
  totalResults: number;
}) {
  return (
    <section className="mb-8 rounded-2xl border border-border/60 bg-card p-5 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Cluster Practice</h2>
          <p className="mt-2 text-muted-foreground">
            Pick a focused topic and practice tightly related vocabulary.
          </p>
        </div>
        {!isLoading && topCluster ? (
          <div className="rounded-xl border border-border/60 bg-secondary/40 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Top Cluster
            </p>
            <p className="mt-1 text-sm font-semibold">
              {topCluster.name} · {topCluster.wordCount} words
            </p>
          </div>
        ) : null}
      </div>
      {!isLoading ? (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm">
            <BookOpen className="h-4 w-4" />
            <span>{totalWords} linked words</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm">
            <Hash className="h-4 w-4" />
            <span>{nonEmptyClusters} active clusters</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm">
            <Sparkles className="h-4 w-4" />
            <span>{totalResults} shown in current result set</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
