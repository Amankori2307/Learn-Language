import { Button } from "@/components/ui/button";

type Bucket = "mastered" | "learning" | "needs_review";

export function WordBucketImprovementCard({
  howToImprove,
}: {
  howToImprove: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <p className="text-sm text-muted-foreground">How to improve</p>
      <p className="mt-1 font-medium">{howToImprove}</p>
    </div>
  );
}

export function WordBucketSwitch({
  bucket,
  changeBucket,
}: {
  bucket: Bucket;
  changeBucket: (bucket: Bucket) => void;
}) {
  return (
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
  );
}
