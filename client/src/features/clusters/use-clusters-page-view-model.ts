import { useEffect, useMemo, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { useClusters } from "@/hooks/use-clusters";
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

  const clustersQuery = useClusters();
  const allClusters = useMemo(() => clustersQuery.data ?? [], [clustersQuery.data]);
  const trackedCatalogKeyRef = useRef<string | null>(null);

  const clusterTypes = useMemo(
    () => [
      "all",
      ...Array.from(new Set(allClusters.map((cluster) => cluster.type).filter(Boolean))).sort(),
    ],
    [allClusters],
  );

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

  const filteredAndSorted = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = allClusters.filter((cluster) => {
      if (typeFilter !== "all" && cluster.type !== typeFilter) {
        return false;
      }
      if (!term) {
        return true;
      }
      return [cluster.name, cluster.description ?? "", cluster.type]
        .join(" ")
        .toLowerCase()
        .includes(term);
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

  const topCluster = useMemo(() => {
    if (allClusters.length === 0) {
      return null;
    }
    return [...allClusters].sort((left, right) => right.wordCount - left.wordCount)[0] ?? null;
  }, [allClusters]);

  const totalWords = useMemo(
    () => allClusters.reduce((sum, cluster) => sum + cluster.wordCount, 0),
    [allClusters],
  );
  const nonEmptyClusters = useMemo(
    () => allClusters.filter((cluster) => cluster.wordCount > 0).length,
    [allClusters],
  );
  const totalResults = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / CLUSTERS_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filteredAndSorted.slice(
    (currentPage - 1) * CLUSTERS_PAGE_SIZE,
    currentPage * CLUSTERS_PAGE_SIZE,
  );

  useEffect(() => {
    if (clustersQuery.isLoading || clustersQuery.isError || !clustersQuery.data) {
      return;
    }

    const analyticsKey = `${query}:${typeFilter}:${sortBy}:${filteredAndSorted.length}`;
    if (trackedCatalogKeyRef.current === analyticsKey) {
      return;
    }

    trackedCatalogKeyRef.current = analyticsKey;
    trackAnalyticsEvent("clusters_catalog_viewed", {
      route: "/clusters",
      totalResults: filteredAndSorted.length,
      typeFilter,
      sortBy,
    });
  }, [clustersQuery.data, clustersQuery.isError, clustersQuery.isLoading, filteredAndSorted.length, query, sortBy, typeFilter]);

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
