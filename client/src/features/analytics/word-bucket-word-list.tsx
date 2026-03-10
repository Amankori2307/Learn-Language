import { Button } from "@/components/ui/button";
import { useWordBucket } from "@/hooks/use-word-bucket";

type WordBucketData = NonNullable<ReturnType<typeof useWordBucket>["data"]>;

export function WordBucketWordList({
  bucket,
  data,
  page,
  totalPages,
  setPage,
}: {
  bucket: "mastered" | "learning" | "needs_review";
  data: WordBucketData;
  page: number;
  totalPages: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
      <div className="space-y-3 p-4 md:hidden">
        {data.words.map((word) => (
          <div
            key={`${bucket}-${word.wordId}`}
            className="rounded-xl border border-border/50 bg-background/70 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">
                  {word.transliteration} ({word.originalScript})
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{word.english}</p>
              </div>
              <span className="rounded-full border border-border/60 bg-secondary px-2 py-1 text-xs">
                {word.masteryLevel}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Wrong</p>
                <p>{word.wrongCount}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Next Review
                </p>
                <p className="text-muted-foreground">
                  {word.nextReview ? new Date(word.nextReview).toLocaleString() : "Not scheduled"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden grid-cols-12 gap-3 border-b border-border/60 bg-secondary/30 px-4 py-3 text-xs font-semibold text-muted-foreground md:grid">
        <div className="col-span-6 md:col-span-4">Word</div>
        <div className="col-span-6 md:col-span-3">Meaning</div>
        <div className="hidden md:block md:col-span-2">Mastery</div>
        <div className="hidden md:block md:col-span-1">Wrong</div>
        <div className="col-span-12 md:col-span-2">Next Review</div>
      </div>
      <div className="hidden divide-y divide-border/50 md:block">
        {data.words.map((word) => (
          <div
            key={`${bucket}-${word.wordId}`}
            className="grid grid-cols-12 items-center gap-3 px-4 py-3"
          >
            <div className="col-span-6 md:col-span-4 min-w-0">
              <p className="truncate font-medium">
                {word.transliteration} ({word.originalScript})
              </p>
            </div>
            <div className="col-span-6 md:col-span-3 min-w-0">
              <p className="truncate text-sm text-muted-foreground">{word.english}</p>
            </div>
            <div className="hidden text-sm md:col-span-2 md:block">{word.masteryLevel}</div>
            <div className="hidden text-sm md:col-span-1 md:block">{word.wrongCount}</div>
            <div className="col-span-12 text-sm text-muted-foreground md:col-span-2">
              {word.nextReview ? new Date(word.nextReview).toLocaleString() : "Not scheduled"}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 border-t border-border/50 bg-secondary/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Page {page} of {totalPages} • {data.total} words
        </p>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
