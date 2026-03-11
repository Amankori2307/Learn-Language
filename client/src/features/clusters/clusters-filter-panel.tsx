import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClusterSortBy } from "@/features/clusters/use-clusters-page-view-model";

export function ClustersFilterPanel({
  query,
  typeFilter,
  sortBy,
  clusterTypes,
  updateQuery,
}: {
  query: string;
  typeFilter: string;
  sortBy: ClusterSortBy;
  clusterTypes: string[];
  updateQuery: (
    next: Partial<{ q: string; type: string; sort: ClusterSortBy; page: number }>,
  ) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border/50 bg-card p-4 md:grid-cols-4 md:p-6">
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
          onChange={(event) => updateQuery({ sort: event.target.value as ClusterSortBy, page: 1 })}
        >
          <option value="words_desc">Word Count (High to Low)</option>
          <option value="words_asc">Word Count (Low to High)</option>
          <option value="name_asc">Name (A-Z)</option>
          <option value="name_desc">Name (Z-A)</option>
          <option value="type_asc">Type (A-Z)</option>
        </select>
      </div>
    </div>
  );
}
