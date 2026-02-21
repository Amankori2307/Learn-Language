import { Layout } from "@/components/layout";
import { useClusters } from "@/hooks/use-clusters";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Layers, ArrowRight, Hash, BookOpen } from "lucide-react";

export default function ClustersPage() {
  const { data: clusters, isLoading } = useClusters();
  const sortedClusters = [...(clusters ?? [])].sort((left, right) => right.wordCount - left.wordCount);
  const totalWords = sortedClusters.reduce((sum, cluster) => sum + cluster.wordCount, 0);
  const nonEmptyClusters = sortedClusters.filter((cluster) => cluster.wordCount > 0).length;

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Word Clusters</h2>
        <p className="text-muted-foreground mt-2">
          Master related words grouped by topic or grammar.
        </p>
        {!isLoading && (
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm">
              <Hash className="w-4 h-4" />
              <span>{nonEmptyClusters} active clusters</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm">
              <BookOpen className="w-4 h-4" />
              <span>{totalWords} linked words</span>
            </div>
          </div>
        )}
      </div>

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
              className="bg-card rounded-3xl p-6 border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <Layers className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-bold mb-2">{cluster.name}</h3>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
                {cluster.description || "A collection of related vocabulary words to boost your fluency."}
              </p>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-1 rounded">
                    {cluster.type}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground bg-primary/10 px-2 py-1 rounded">
                    {cluster.wordCount} words
                  </span>
                </div>
                <Link href={`/quiz?mode=cluster&clusterId=${cluster.id}`}>
                  <Button variant="ghost" className="hover:bg-blue-50 hover:text-blue-600 gap-2 group-hover:translate-x-1 transition-transform">
                    Start <ArrowRight className="w-4 h-4" />
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
