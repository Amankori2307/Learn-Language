import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { useClusters, useCluster } from "@/hooks/use-clusters";
import { Button } from "@/components/ui/button";
import { BookText, ArrowRight } from "lucide-react";

type StoryLine = {
  originalScript: string;
  pronunciation: string;
  english: string;
};

function buildStoryLines(words: Array<{ originalScript: string; transliteration?: string | null; english: string; exampleSentences?: string[] }>): StoryLine[] {
  return words.slice(0, 6).map((word) => ({
    originalScript: word.exampleSentences?.[0] || `${word.originalScript} ఉపయోగించండి.`,
    pronunciation: word.transliteration?.trim() ? `${word.transliteration} (${word.originalScript})` : word.originalScript,
    english: `Context hint: ${word.english}`,
  }));
}

export default function ContextualPage() {
  const { data: clusters, isLoading: clustersLoading } = useClusters();
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);

  const activeClusterId = selectedClusterId ?? clusters?.[0]?.id ?? null;
  const { data: clusterData, isLoading: clusterLoading } = useCluster(activeClusterId ?? 0);

  const storyLines = useMemo(() => {
    if (!clusterData?.words || clusterData.words.length === 0) return [];
    return buildStoryLines(clusterData.words as any);
  }, [clusterData]);

  const loading = clustersLoading || (activeClusterId !== null && clusterLoading);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-3xl font-bold">Contextual Learning Mode</h2>
            <p className="text-muted-foreground mt-1">
              Learn words inside short Source Language context lines, then jump into a focused workout.
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
          <label className="text-sm font-medium text-muted-foreground">Choose Context Cluster</label>
          <select
            className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={activeClusterId ?? ""}
            onChange={(e) => setSelectedClusterId(Number(e.target.value))}
          >
            {(clusters ?? []).map((cluster) => (
              <option key={cluster.id} value={cluster.id}>
                {cluster.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-muted-foreground">Loading contextual lines...</div>
        ) : storyLines.length === 0 ? (
          <div className="text-muted-foreground">No contextual lines available for this cluster yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storyLines.map((line, idx) => (
              <div key={`${line.originalScript}-${idx}`} className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <BookText className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Context {idx + 1}</span>
                </div>
                <p className="text-lg font-originalScript leading-relaxed">{line.originalScript}</p>
                <p className="text-sm text-foreground/80 mt-2">
                  Pronunciation: <span className="font-medium">{line.pronunciation}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">{line.english}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
