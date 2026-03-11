import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PendingButton } from "@/components/ui/pending-button";
import { ReviewStatusEnum } from "@shared/domain/enums";

export function ReviewBulkActions({
  notes,
  setNotes,
  selectedCount,
  runBulk,
  clearSelection,
  isBulkPending,
}: {
  notes: string;
  setNotes: (value: string) => void;
  selectedCount: number;
  runBulk: (target: ReviewStatusEnum) => void;
  clearSelection: () => void;
  isBulkPending: boolean;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/50 bg-card p-4 md:p-6">
      <Label htmlFor="review-notes">Review Notes (applied to bulk action)</Label>
      <Input
        id="review-notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional notes for audit trail"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <PendingButton
          onClick={() => runBulk(ReviewStatusEnum.APPROVED)}
          disabled={selectedCount === 0}
          pending={isBulkPending}
          pendingLabel="Approving..."
          className="w-full sm:w-auto"
        >
          Bulk Approve
        </PendingButton>
        <PendingButton
          variant="destructive"
          onClick={() => runBulk(ReviewStatusEnum.REJECTED)}
          disabled={selectedCount === 0}
          pending={isBulkPending}
          pendingLabel="Rejecting..."
          className="w-full sm:w-auto"
        >
          Bulk Reject
        </PendingButton>
        <Button
          variant="outline"
          onClick={clearSelection}
          disabled={selectedCount === 0}
          className="w-full sm:w-auto"
        >
          Clear Selection
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{selectedCount} selected</p>
    </div>
  );
}
