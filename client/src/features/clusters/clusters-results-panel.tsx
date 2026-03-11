import { Button } from "@/components/ui/button";
import { SurfaceMessage } from "@/components/ui/page-states";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import type { ClusterSortBy } from "@/features/clusters/use-clusters-page-view-model";

type ClusterRow = {
  id: number;
  name: string;
  type: string;
  wordCount: number;
  description?: string | null;
};

export function ClustersResultsPanel({
  pageRows,
  currentPage,
  totalPages,
  totalResults,
  updateQuery,
}: {
  pageRows: ClusterRow[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
  updateQuery: (
    next: Partial<{ q: string; type: string; sort: ClusterSortBy; page: number }>,
  ) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
      <div className="grid grid-cols-12 gap-3 border-b border-border/60 bg-secondary/30 px-4 py-3 text-xs font-semibold text-muted-foreground">
        <div className="col-span-4 md:col-span-3">Cluster</div>
        <div className="col-span-3 md:col-span-2">Type</div>
        <div className="col-span-3 text-right md:col-span-2">Word Count</div>
        <div className="hidden md:col-span-3 md:block">Description</div>
        <div className="col-span-2 text-right md:col-span-2">Action</div>
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
            <div key={cluster.id} className="grid grid-cols-12 items-center gap-3 px-4 py-3">
              <div className="col-span-4 min-w-0 md:col-span-3">
                <p className="truncate font-medium">{cluster.name}</p>
              </div>
              <div className="col-span-3 truncate text-sm text-muted-foreground md:col-span-2">
                {cluster.type}
              </div>
              <div className="col-span-3 text-right text-sm md:col-span-2">{cluster.wordCount}</div>
              <div className="hidden truncate text-sm text-muted-foreground md:col-span-3 md:block">
                {cluster.description || "No description"}
              </div>
              <div className="col-span-2 text-right md:col-span-2">
                <Link href={`/quiz?mode=cluster&clusterId=${cluster.id}`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    Practice <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-border/50 bg-secondary/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Page {currentPage} of {totalPages} • {totalResults} results
        </p>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateQuery({ page: Math.max(1, currentPage - 1) })}
            disabled={currentPage <= 1}
            className="w-full sm:w-auto"
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateQuery({ page: Math.min(totalPages, currentPage + 1) })}
            disabled={currentPage >= totalPages}
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
