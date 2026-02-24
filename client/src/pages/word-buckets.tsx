import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useWordBucketsViewModel } from "@/features/analytics/use-word-buckets-view-model";
import { QuizModeEnum } from "@shared/domain/enums";

export default function WordBucketsPage() {
  const { bucket, page, totalPages, setPage, bucketQuery, changeBucket, navigate } = useWordBucketsViewModel();
  const data = bucketQuery.data;
  const bucketCta = {
    mastered: {
      title: "Keep Mastered Words Fresh",
      description: "Run a daily review to keep retention high and avoid memory decay.",
      primaryLabel: "Start Daily Review",
      primaryHref: `/quiz?mode=${QuizModeEnum.DAILY_REVIEW}`,
      secondaryLabel: "Practice by Cluster",
      secondaryHref: "/clusters",
    },
    learning: {
      title: "Push Learning Words to Mastered",
      description: "Continue new words and daily review to move in-progress words to mastery.",
      primaryLabel: "Continue New Words",
      primaryHref: `/quiz?mode=${QuizModeEnum.NEW_WORDS}`,
      secondaryLabel: "Start Daily Review",
      secondaryHref: `/quiz?mode=${QuizModeEnum.DAILY_REVIEW}`,
    },
    needs_review: {
      title: "Recover Needs Review Words",
      description: "Start weak-word drills and then run daily review for reinforcement.",
      primaryLabel: "Practice Weak Words",
      primaryHref: `/quiz?mode=${QuizModeEnum.WEAK_WORDS}`,
      secondaryLabel: "Start Daily Review",
      secondaryHref: `/quiz?mode=${QuizModeEnum.DAILY_REVIEW}`,
    },
  }[bucket];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">{data?.title ?? "Word Bucket"}</h1>
            <p className="text-muted-foreground mt-1">{data?.meaning ?? "Track your progress state by word."}</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Dashboard
          </Button>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-4">
          <p className="text-sm text-muted-foreground">How to improve</p>
          <p className="font-medium mt-1">{data?.howToImprove ?? "Keep practicing daily with consistent review."}</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Next action</p>
              <h2 className="text-lg font-semibold mt-1">{bucketCta.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{bucketCta.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate(bucketCta.primaryHref)}>{bucketCta.primaryLabel}</Button>
              <Button variant="outline" onClick={() => navigate(bucketCta.secondaryHref)}>
                {bucketCta.secondaryLabel}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant={bucket === "mastered" ? "default" : "outline"} onClick={() => changeBucket("mastered")}>
            Mastered
          </Button>
          <Button variant={bucket === "learning" ? "default" : "outline"} onClick={() => changeBucket("learning")}>
            Learning
          </Button>
          <Button
            variant={bucket === "needs_review" ? "default" : "outline"}
            onClick={() => changeBucket("needs_review")}
          >
            Needs Review
          </Button>
        </div>

        {bucketQuery.isLoading ? (
          <div className="rounded-2xl border border-border/50 bg-card p-8 text-muted-foreground">Loading words...</div>
        ) : bucketQuery.isError ? (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-8">
            <p className="font-medium text-red-700">Could not load words.</p>
            <Button variant="outline" className="mt-3" onClick={() => bucketQuery.refetch()}>
              Retry
            </Button>
          </div>
        ) : (data?.words.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-card p-8 text-muted-foreground">
            No words in this bucket yet.
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-semibold text-muted-foreground border-b border-border/60 bg-secondary/30">
              <div className="col-span-6 md:col-span-4">Word</div>
              <div className="col-span-6 md:col-span-3">Meaning</div>
              <div className="hidden md:block md:col-span-2">Mastery</div>
              <div className="hidden md:block md:col-span-1">Wrong</div>
              <div className="col-span-12 md:col-span-2">Next Review</div>
            </div>
            <div className="divide-y divide-border/50">
              {data?.words.map((word) => (
                <div key={`${bucket}-${word.wordId}`} className="grid grid-cols-12 gap-3 px-4 py-3 items-center">
                  <div className="col-span-6 md:col-span-4 min-w-0">
                    <p className="font-medium truncate">{word.transliteration} ({word.originalScript})</p>
                  </div>
                  <div className="col-span-6 md:col-span-3 min-w-0">
                    <p className="text-sm text-muted-foreground truncate">{word.english}</p>
                  </div>
                  <div className="hidden md:block md:col-span-2 text-sm">{word.masteryLevel}</div>
                  <div className="hidden md:block md:col-span-1 text-sm">{word.wrongCount}</div>
                  <div className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
                    {word.nextReview ? new Date(word.nextReview).toLocaleString() : "Not scheduled"}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-secondary/20">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages} • {data?.total ?? 0} words
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
