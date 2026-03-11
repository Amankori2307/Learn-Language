import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useContextualPageViewModel } from "@/features/contextual/use-contextual-page-view-model";
import { CardGridSkeleton, SurfaceMessage } from "@/components/ui/page-states";
import { ContextualStoryGrid } from "@/features/contextual/contextual-story-grid";
import {
  ContextualClusterSelector,
  ContextualHeader,
} from "@/features/contextual/contextual-header";

export default function ContextualPage() {
  const {
    setSelectedClusterId,
    activeClusterId,
    clusters,
    storyLines,
    isLoading,
    isError,
    retry,
  } = useContextualPageViewModel();

  return (
    <Layout>
      <div className="space-y-6">
        <ContextualHeader activeClusterId={activeClusterId} />

        <ContextualClusterSelector
          activeClusterId={activeClusterId}
          clusters={clusters}
          setSelectedClusterId={setSelectedClusterId}
        />

        {isLoading ? (
          <CardGridSkeleton cards={4} className="md:grid-cols-2 xl:grid-cols-2" />
        ) : isError ? (
          <SurfaceMessage
            title="Failed to load contextual lines"
            description="The contextual learning request failed before examples could be shown."
            tone="error"
            action={
              <Button variant="outline" onClick={() => void retry()}>
                Retry
              </Button>
            }
          />
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
