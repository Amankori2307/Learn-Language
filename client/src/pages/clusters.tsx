import { Layout } from "@/components/layout";
import { useClusters } from "@/hooks/use-clusters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation, useSearch } from "wouter";
import { ArrowRight, BookOpen, Hash, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { CLUSTERS_PAGE_SIZE } from "@/features/clusters/clusters.constants";

type SortBy = "name_asc" | "name_desc" | "type_asc" | "words_desc" | "words_asc";

export default function ClustersPage() {
  const [, setLocation] = useLocation();
  const searchText = useSearch();
  const params = new URLSearchParams(searchText);
  const query = params.get("q") ?? "";
  const typeFilter = params.get("type") ?? "all";
  const sortBy = (params.get("sort") as SortBy) || "words_desc";
  const pageParam = Number.parseInt(params.get("page") ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const { data: clusters, isLoading } = useClusters();
  const allClusters = useMemo(() => clusters ?? [], [clusters]);

  const clusterTypes = useMemo(
    () => ["all", ...Array.from(new Set(allClusters.map((cluster) => cluster.type).filter(Boolean))).sort()],
    [allClusters],
  );

  const updateQuery = (next: Partial<{ q: string; type: string; sort: SortBy; page: number }>) => {
    const nextParams = new URLSearchParams(searchText);
    const setOrDelete = (key: string, value: string | undefined) => {
      if (!value || value === "all" || value === "") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    };

    if (Object.prototype.hasOwnProperty.call(next, "q")) {
      setOrDelete("q", next.q?.trim());
    }
    if (Object.prototype.hasOwnProperty.call(next, "type")) {
      setOrDelete("type", next.type);
    }
    if (Object.prototype.hasOwnProperty.call(next, "sort")) {
      setOrDelete("sort", next.sort);
    }
    if (Object.prototype.hasOwnProperty.call(next, "page")) {
      const value = next.page && next.page > 1 ? String(next.page) : "";
      setOrDelete("page", value);
    }

    const qs = nextParams.toString();
    setLocation(`/clusters${qs ? `?${qs}` : ""}`);
  };

  const filteredAndSorted = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = allClusters.filter((cluster) => {
      if (typeFilter !== "all" && cluster.type !== typeFilter) {
        return false;
      }
      if (!term) {
        return true;
      }
      return [cluster.name, cluster.description ?? "", cluster.type].join(" ").toLowerCase().includes(term);
    });

    filtered.sort((a, b) => {
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "name_desc") return b.name.localeCompare(a.name);
      if (sortBy === "type_asc") return a.type.localeCompare(b.type);
      if (sortBy === "words_asc") return a.wordCount - b.wordCount;
      return b.wordCount - a.wordCount;
    });

    return filtered;
  }, [allClusters, query, sortBy, typeFilter]);

  const totalWords = allClusters.reduce((sum, cluster) => sum + cluster.wordCount, 0);
  const nonEmptyClusters = allClusters.filter((cluster) => cluster.wordCount > 0).length;
  const totalResults = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / CLUSTERS_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filteredAndSorted.slice(
    (currentPage - 1) * CLUSTERS_PAGE_SIZE,
    currentPage * CLUSTERS_PAGE_SIZE,
  );

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
          {!isLoading && allClusters.length > 0 && (
            <div className="rounded-xl border border-border/60 bg-secondary/40 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Top Cluster
              </p>
              <p className="text-sm font-semibold mt-1">
                {[...allClusters].sort((left, right) => right.wordCount - left.wordCount)[0]?.name} · {[...allClusters].sort((left, right) => right.wordCount - left.wordCount)[0]?.wordCount ?? 0} words
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
        <div className="rounded-2xl border border-border/50 bg-card p-8 text-muted-foreground">Loading clusters...</div>
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
                onChange={(event) => updateQuery({ sort: event.target.value as SortBy, page: 1 })}
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
              <div className="px-4 py-8 text-muted-foreground text-sm">No clusters match current filters.</div>
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
