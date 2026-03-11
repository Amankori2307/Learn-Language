import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useContextualPageViewModel } from "@/features/contextual/use-contextual-page-view-model";
import { CardGridSkeleton, SurfaceMessage } from "@/components/ui/page-states";
import { ContextualStoryGrid } from "@/features/contextual/contextual-story-grid";

export default function ContextualPage() {
  const {
    setSelectedClusterId,
    activeClusterId,
    clusters,
    storyLines,
    isLoading,
  } = useContextualPageViewModel();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-3xl font-bold">Contextual Learning Mode</h2>
            <p className="text-muted-foreground mt-1">
              Learn words inside short Source Language context lines, then jump into a focused
              workout.
            </p>
          </div>
          {activeClusterId && (
            <Link href={`/quiz?mode=complex_workout&clusterId=${activeClusterId}`}>
              <Button className="gap-2">
                Start Context Workout <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-4">
          <label className="text-sm font-medium text-muted-foreground">
            Choose Context Cluster
          </label>
          <select
            className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
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

        {isLoading ? (
          <CardGridSkeleton cards={4} className="md:grid-cols-2 xl:grid-cols-2" />
        ) : storyLines.length === 0 ? (
          <SurfaceMessage
            title="No contextual lines yet"
            description="This cluster does not have enough example-backed context lines yet."
            tone="empty"
          />
        ) : (
          <ContextualStoryGrid storyLines={storyLines} />
        )}
      </div>
    </Layout>
  );
}
