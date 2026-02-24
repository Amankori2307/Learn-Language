import { useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useWordBucket, type WordBucketType } from "@/hooks/use-word-bucket";

export const WORD_BUCKET_PAGE_SIZE = 20;

function parseBucket(raw: string | null): WordBucketType {
  if (raw === "mastered" || raw === "learning" || raw === "needs_review") return raw;
  return "learning";
}

export function useWordBucketsViewModel() {
  const [, navigate] = useLocation();
  const searchText = useSearch();
  const bucket = useMemo(() => {
    const params = new URLSearchParams(searchText);
    return parseBucket(params.get("bucket"));
  }, [searchText]);
  const [page, setPage] = useState(1);
  const bucketQuery = useWordBucket(bucket, page, WORD_BUCKET_PAGE_SIZE);

  const totalPages = Math.max(1, Math.ceil((bucketQuery.data?.total ?? 0) / WORD_BUCKET_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const changeBucket = (nextBucket: WordBucketType) => {
    setPage(1);
    navigate(`/analytics/words?bucket=${nextBucket}`);
  };

  return {
    bucket,
    page: safePage,
    totalPages,
    setPage,
    bucketQuery,
    changeBucket,
    navigate,
  };
}
