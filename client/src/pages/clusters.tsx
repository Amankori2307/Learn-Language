import { Layout } from "@/components/layout";
import { useClusters } from "@/hooks/use-clusters";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Layers, ArrowRight, Hash, BookOpen, Sparkles } from "lucide-react";

export default function ClustersPage() {
  const { data: clusters, isLoading } = useClusters();
  const sortedClusters = [...(clusters ?? [])].sort((left, right) => right.wordCount - left.wordCount);
  const totalWords = sortedClusters.reduce((sum, cluster) => sum + cluster.wordCount, 0);
  const nonEmptyClusters = sortedClusters.filter((cluster) => cluster.wordCount > 0).length;
  const topClusters = sortedClusters.slice(0, 3);

  return (
    <Layout>
      <section className="mb-8 rounded-2xl border border-border/60 bg-card p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Cluster Practice</h2>
            <p className="text-muted-foreground mt-2">
              Pick a focused topic and practice tightly related vocabulary.
            </p>
          </div>
          {!isLoading && topClusters.length > 0 && (
            <div className="rounded-xl border border-border/60 bg-secondary/40 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Most Loaded Cluster
              </p>
              <p className="text-sm font-semibold mt-1">
                {topClusters[0].name} · {topClusters[0].wordCount} words
              </p>
            </div>
          )}
        </div>
        {!isLoading && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm">
              <BookOpen className="w-4 h-4" />
              <span>{totalWords} linked words</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm">
              <Hash className="w-4 h-4" />
              <span>{nonEmptyClusters} active clusters</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>{Math.max(0, nonEmptyClusters - topClusters.length)} more clusters to explore</span>
            </div>
          </div>
        )}
      </section>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-secondary/50 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedClusters.map((cluster) => (
            <div
              key={cluster.id}
              className="bg-card rounded-2xl p-5 border border-border/60 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 group flex flex-col"
            >
              <div className="w-11 h-11 bg-secondary text-foreground rounded-xl flex items-center justify-center mb-4 group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                <Layers className="w-5 h-5" />
              </div>

              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-lg font-semibold leading-tight">{cluster.name}</h3>
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground bg-primary/10 px-2 py-1 rounded shrink-0">
                  {cluster.wordCount} words
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-5">
                {cluster.description || "A collection of related vocabulary words to boost your fluency."}
              </p>

              <div className="flex items-center justify-between mt-auto pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-1 rounded">
                  {cluster.type}
                </span>
                <Link href={`/quiz?mode=cluster&clusterId=${cluster.id}`}>
                  <Button variant="outline" className="gap-2 group-hover:translate-x-0.5 transition-transform">
                    Practice <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
