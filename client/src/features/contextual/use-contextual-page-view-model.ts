import { useMemo, useState } from "react";
import { useCluster, useClusters } from "@/hooks/use-clusters";

type StoryLine = {
  originalScript: string;
  pronunciation: string;
  english: string;
};

function buildStoryLines(
  words: Array<{
    originalScript: string;
    transliteration?: string | null;
    english: string;
    exampleSentences?: string[];
  }>,
): StoryLine[] {
  return words.slice(0, 6).map((word) => ({
    originalScript: word.exampleSentences?.[0] || `Use ${word.originalScript} in context.`,
    pronunciation: word.transliteration?.trim()
      ? `${word.transliteration} (${word.originalScript})`
      : word.originalScript,
    english: `Context hint: ${word.english}`,
  }));
}

export function useContextualPageViewModel() {
  const clustersQuery = useClusters();
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);

  const activeClusterId = selectedClusterId ?? clustersQuery.data?.[0]?.id ?? null;
  const clusterQuery = useCluster(activeClusterId ?? 0);

  const storyLines = useMemo(() => {
    if (!clusterQuery.data?.words || clusterQuery.data.words.length === 0) return [];
    return buildStoryLines(clusterQuery.data.words as any);
  }, [clusterQuery.data]);

  const loading = clustersQuery.isLoading || (activeClusterId !== null && clusterQuery.isLoading);
  const isError =
    clustersQuery.isError || (activeClusterId !== null && clusterQuery.isError && !clusterQuery.data);

  return {
    selectedClusterId,
    setSelectedClusterId,
    activeClusterId,
    clusters: clustersQuery.data ?? [],
    storyLines,
    isLoading: loading,
    isError,
    retry: async () => {
      await Promise.all([clustersQuery.refetch(), activeClusterId !== null ? clusterQuery.refetch() : null]);
    },
  };
}
