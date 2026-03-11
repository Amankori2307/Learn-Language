import { Layout } from "@/components/layout";
import {
  useClustersPageViewModel,
} from "@/features/clusters/use-clusters-page-view-model";
import { TableSurfaceSkeleton } from "@/components/ui/page-states";
import { ClustersFilterPanel } from "@/features/clusters/clusters-filter-panel";
import { ClustersHeader } from "@/features/clusters/clusters-header";
import { ClustersResultsPanel } from "@/features/clusters/clusters-results-panel";

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
      <ClustersHeader
        isLoading={isLoading}
        topCluster={topCluster}
        totalWords={totalWords}
        nonEmptyClusters={nonEmptyClusters}
        totalResults={totalResults}
      />

      {isLoading ? (
        <TableSurfaceSkeleton rows={6} columns={4} />
      ) : (
        <div className="space-y-4">
          <ClustersFilterPanel
            query={query}
            typeFilter={typeFilter}
            sortBy={sortBy}
            clusterTypes={clusterTypes}
            updateQuery={updateQuery}
          />

          <ClustersResultsPanel
            pageRows={pageRows}
            currentPage={currentPage}
            totalPages={totalPages}
            totalResults={totalResults}
            updateQuery={updateQuery}
          />
        </div>
      )}
    </Layout>
  );
}
