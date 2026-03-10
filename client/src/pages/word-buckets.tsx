import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useWordBucketsViewModel } from "@/features/analytics/use-word-buckets-view-model";
import { QuizModeEnum } from "@shared/domain/enums";
import { SurfaceMessage, TableSurfaceSkeleton } from "@/components/ui/page-states";
import { WordBucketWordList } from "@/features/analytics/word-bucket-word-list";

export default function WordBucketsPage() {
  const {
    bucket,
    page,
    totalPages,
    setPage,
    data,
    isLoading,
    isError,
    retry,
    changeBucket,
    navigate,
  } = useWordBucketsViewModel();
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{data?.title ?? "Word Bucket"}</h1>
            <p className="text-muted-foreground mt-1">
              {data?.meaning ?? "Track your progress state by word."}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Dashboard
          </Button>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-4">
          <p className="text-sm text-muted-foreground">How to improve</p>
          <p className="font-medium mt-1">
            {data?.howToImprove ?? "Keep practicing daily with consistent review."}
          </p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-4 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Next action</p>
              <h2 className="text-lg font-semibold mt-1">{bucketCta.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{bucketCta.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate(bucketCta.primaryHref)}>
                {bucketCta.primaryLabel}
              </Button>
              <Button variant="outline" onClick={() => navigate(bucketCta.secondaryHref)}>
                {bucketCta.secondaryLabel}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
          <Button
            variant={bucket === "mastered" ? "default" : "outline"}
            onClick={() => changeBucket("mastered")}
          >
            Mastered
          </Button>
          <Button
            variant={bucket === "learning" ? "default" : "outline"}
            onClick={() => changeBucket("learning")}
          >
            Learning
          </Button>
          <Button
            variant={bucket === "needs_review" ? "default" : "outline"}
            onClick={() => changeBucket("needs_review")}
          >
            Needs Review
          </Button>
        </div>

        {isLoading ? (
          <TableSurfaceSkeleton rows={8} columns={5} />
        ) : isError ? (
          <SurfaceMessage
            title="Could not load bucket words"
            description="The bucket request failed before the word list could be shown."
            tone="error"
            action={
              <Button variant="outline" onClick={retry}>
                Retry
              </Button>
            }
          />
        ) : (data?.words.length ?? 0) === 0 ? (
          <SurfaceMessage
            title="No words in this bucket yet"
            description="Keep practicing and this bucket will populate automatically."
            tone="empty"
          />
        ) : (
          <WordBucketWordList
            bucket={bucket}
            data={data}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
          />
        )}
      </div>
    </Layout>
  );
}
