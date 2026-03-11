import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useWordBucketsViewModel } from "@/features/analytics/use-word-buckets-view-model";
import { QuizModeEnum } from "@shared/domain/enums";
import { SurfaceMessage, TableSurfaceSkeleton } from "@/components/ui/page-states";
import { WordBucketWordList } from "@/features/analytics/word-bucket-word-list";
import {
  WordBucketHeader,
  WordBucketNextAction,
} from "@/features/analytics/word-bucket-header";

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
        <WordBucketHeader
          title={data?.title ?? "Word Bucket"}
          meaning={data?.meaning ?? "Track your progress state by word."}
          onBack={() => navigate("/")}
        />

        <div className="rounded-xl border border-border/50 bg-card p-4">
          <p className="text-sm text-muted-foreground">How to improve</p>
          <p className="font-medium mt-1">
            {data?.howToImprove ?? "Keep practicing daily with consistent review."}
          </p>
        </div>

        <WordBucketNextAction
          title={bucketCta.title}
          description={bucketCta.description}
          primaryLabel={bucketCta.primaryLabel}
          secondaryLabel={bucketCta.secondaryLabel}
          onPrimary={() => navigate(bucketCta.primaryHref)}
          onSecondary={() => navigate(bucketCta.secondaryHref)}
        />

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
            data={data!}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
          />
        )}
      </div>
    </Layout>
  );
}
