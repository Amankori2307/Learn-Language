import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { ReviewStatus } from "@/hooks/use-review";

export function ReviewPageHeader({
  status,
  setStatus,
  statusOptions,
}: {
  status: ReviewStatus;
  setStatus: React.Dispatch<React.SetStateAction<ReviewStatus>>;
  statusOptions: ReviewStatus[];
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold">Review Queue</h1>
        <p className="text-muted-foreground">
          Approve or reject vocabulary before learner exposure.
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
        {statusOptions.map((option) => (
          <Button
            key={option}
            variant={status === option ? "default" : "outline"}
            onClick={() => setStatus(option)}
            className="w-full sm:w-auto"
          >
            {option}
          </Button>
        ))}
        <Link href="/review/add">
          <Button variant="secondary" className="w-full sm:w-auto">
            Go to Add Vocabulary
          </Button>
        </Link>
      </div>
    </div>
  );
}
