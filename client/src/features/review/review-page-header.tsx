import { Button } from "@/components/ui/button";
import { PendingButton } from "@/components/ui/pending-button";
import { Link } from "wouter";
import type { ReviewStatus } from "@/hooks/use-review";
import { getReviewStatusDescription } from "@/features/review/use-review-page-view-model";

export function ReviewPageHeader({
  status,
  setStatus,
  statusOptions,
  canDownloadVocabularyExport = false,
  onDownloadVocabularyExport,
  isDownloadingVocabularyExport = false,
}: {
  status: ReviewStatus;
  setStatus: React.Dispatch<React.SetStateAction<ReviewStatus>>;
  statusOptions: ReviewStatus[];
  canDownloadVocabularyExport?: boolean;
  onDownloadVocabularyExport?: () => void;
  isDownloadingVocabularyExport?: boolean;
}) {
  const statusDescription = getReviewStatusDescription(status);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Review Queue</h1>
        <p className="text-muted-foreground">{statusDescription}</p>
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
        {canDownloadVocabularyExport ? (
          <PendingButton
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={onDownloadVocabularyExport}
            pending={isDownloadingVocabularyExport}
            pendingLabel="Preparing export..."
          >
            Download Vocab Data
          </PendingButton>
        ) : null}
        <Link href="/review/add">
          <Button variant="secondary" className="w-full sm:w-auto">
            Go to Add Vocabulary
          </Button>
        </Link>
      </div>
    </div>
  );
}
