import { useEffect, useMemo, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { useClustersCatalog } from "@/hooks/use-clusters";
import { CLUSTERS_PAGE_SIZE } from "./clusters.constants";
import { trackAnalyticsEvent } from "@/lib/analytics";

export type ClusterSortBy = "name_asc" | "name_desc" | "type_asc" | "words_desc" | "words_asc";

export function useClustersPageViewModel() {
  const [, setLocation] = useLocation();
  const searchText = useSearch();
  const params = useMemo(() => new URLSearchParams(searchText), [searchText]);
  const query = params.get("q") ?? "";
  const typeFilter = params.get("type") ?? "all";
  const sortBy = (params.get("sort") as ClusterSortBy) || "words_desc";
  const pageParam = Number.parseInt(params.get("page") ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const clustersQuery = useClustersCatalog({
    q: query,
    type: typeFilter,
    sort: sortBy,
    page,
    limit: CLUSTERS_PAGE_SIZE,
  });
  const trackedCatalogKeyRef = useRef<string | null>(null);

  const updateQuery = (
    next: Partial<{ q: string; type: string; sort: ClusterSortBy; page: number }>,
  ) => {
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

  const clusterTypes = clustersQuery.data?.availableTypes ?? ["all"];
  const totalResults = clustersQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalResults / CLUSTERS_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = clustersQuery.data?.items ?? [];
  const topCluster = clustersQuery.data?.summary.topCluster ?? null;
  const totalWords = clustersQuery.data?.summary.totalWords ?? 0;
  const nonEmptyClusters = clustersQuery.data?.summary.nonEmptyClusters ?? 0;

  useEffect(() => {
    if (clustersQuery.isLoading || clustersQuery.isError || !clustersQuery.data) {
      return;
    }

    const analyticsKey = `${query}:${typeFilter}:${sortBy}:${totalResults}`;
    if (trackedCatalogKeyRef.current === analyticsKey) {
      return;
    }

    trackedCatalogKeyRef.current = analyticsKey;
    trackAnalyticsEvent("clusters_catalog_viewed", {
      route: "/clusters",
      totalResults,
      typeFilter,
      sortBy,
    });
  }, [clustersQuery.data, clustersQuery.isError, clustersQuery.isLoading, query, sortBy, totalResults, typeFilter]);

  return {
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
    isLoading: clustersQuery.isLoading,
    isError: clustersQuery.isError,
    retry: () => clustersQuery.refetch(),
  };
}
