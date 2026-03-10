import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { ArrowRight, BookOpen, Hash, Sparkles } from "lucide-react";
import {
  useClustersPageViewModel,
  type ClusterSortBy,
} from "@/features/clusters/use-clusters-page-view-model";
import { SurfaceMessage, TableSurfaceSkeleton } from "@/components/ui/page-states";

export default function ClustersPage() {
  const {
    query,
    typeFilter,
    sortBy,
    clusterTypes,
    updateQuery,
    topCluster,
    totalWords,
    nonEmptyClusters,
    totalResults,
    totalPages,
    currentPage,
    pageRows,
    isLoading,
  } = useClustersPageViewModel();

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
          {!isLoading && topCluster && (
            <div className="rounded-xl border border-border/60 bg-secondary/40 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Top Cluster
              </p>
              <p className="text-sm font-semibold mt-1">
                {topCluster.name} · {topCluster.wordCount} words
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
              <span>{totalResults} shown in current result set</span>
            </div>
          </div>
        )}
      </section>

      {isLoading ? (
        <TableSurfaceSkeleton rows={6} columns={4} />
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/50 bg-card p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="cluster-search">Search</Label>
              <Input
                id="cluster-search"
                value={query}
                onChange={(event) => updateQuery({ q: event.target.value, page: 1 })}
                placeholder="Search by name, type, description"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cluster-type-filter">Type</Label>
              <select
                id="cluster-type-filter"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={typeFilter}
                onChange={(event) => updateQuery({ type: event.target.value, page: 1 })}
              >
                {clusterTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "all" ? "All Types" : type}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="cluster-sort">Sort</Label>
              <select
                id="cluster-sort"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={sortBy}
                onChange={(event) =>
                  updateQuery({ sort: event.target.value as ClusterSortBy, page: 1 })
                }
              >
                <option value="words_desc">Word Count (High to Low)</option>
                <option value="words_asc">Word Count (Low to High)</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="type_asc">Type (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-semibold text-muted-foreground border-b border-border/60 bg-secondary/30">
              <div className="col-span-4 md:col-span-3">Cluster</div>
              <div className="col-span-3 md:col-span-2">Type</div>
              <div className="col-span-3 md:col-span-2 text-right">Word Count</div>
              <div className="hidden md:block md:col-span-3">Description</div>
              <div className="col-span-2 md:col-span-2 text-right">Action</div>
            </div>

            {pageRows.length === 0 ? (
              <div className="px-4 py-6">
                <SurfaceMessage
                  title="No clusters found"
                  description="No clusters match the current search and filter combination."
                  tone="empty"
                  className="p-6"
                />
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {pageRows.map((cluster) => (
                  <div key={cluster.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center">
                    <div className="col-span-4 md:col-span-3 min-w-0">
                      <p className="font-medium truncate">{cluster.name}</p>
                    </div>
                    <div className="col-span-3 md:col-span-2 text-sm text-muted-foreground truncate">
                      {cluster.type}
                    </div>
                    <div className="col-span-3 md:col-span-2 text-sm text-right">
                      {cluster.wordCount}
                    </div>
                    <div className="hidden md:block md:col-span-3 text-sm text-muted-foreground truncate">
                      {cluster.description || "No description"}
                    </div>
                    <div className="col-span-2 md:col-span-2 text-right">
                      <Link href={`/quiz?mode=cluster&clusterId=${cluster.id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          Practice <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-secondary/20">
              <p className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages} • {totalResults} results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuery({ page: Math.max(1, currentPage - 1) })}
                  disabled={currentPage <= 1}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuery({ page: Math.min(totalPages, currentPage + 1) })}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
