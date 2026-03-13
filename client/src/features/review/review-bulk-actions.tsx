import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PendingButton } from "@/components/ui/pending-button";
import { ReviewStatusEnum } from "@shared/domain/enums";
import type { ReviewStatus } from "@/hooks/use-review";

function getBulkActionConfig(status: ReviewStatus) {
  if (status === ReviewStatusEnum.APPROVED) {
    return [
      {
        toStatus: ReviewStatusEnum.REJECTED,
        label: "Bulk Un-approve",
        pendingLabel: "Updating...",
        variant: "destructive" as const,
      },
    ];
  }

  if (status === ReviewStatusEnum.REJECTED) {
    return [
      {
        toStatus: ReviewStatusEnum.PENDING_REVIEW,
        label: "Bulk Move for Approval",
        pendingLabel: "Updating...",
        variant: "default" as const,
      },
    ];
  }

  return [
    {
      toStatus: ReviewStatusEnum.APPROVED,
      label: "Bulk Approve",
      pendingLabel: "Approving...",
      variant: "default" as const,
    },
    {
      toStatus: ReviewStatusEnum.REJECTED,
      label: "Bulk Reject",
      pendingLabel: "Rejecting...",
      variant: "destructive" as const,
    },
  ];
}

export function ReviewBulkActions({
  status,
  notes,
  setNotes,
  selectedCount,
  runBulk,
  clearSelection,
  isBulkPending,
}: {
  status: ReviewStatus;
  notes: string;
  setNotes: (value: string) => void;
  selectedCount: number;
  runBulk: (target: ReviewStatusEnum) => void;
  clearSelection: () => void;
  isBulkPending: boolean;
}) {
  const actions = getBulkActionConfig(status);

  return (
    <div className="space-y-3 rounded-2xl border border-border/50 bg-card p-4 md:p-6">
      <Label htmlFor="review-notes">Review Notes (applied to bulk action)</Label>
      <Input
        id="review-notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional notes for audit trail"
      />
      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-row sm:flex-wrap">
        {actions.map((action) => (
          <PendingButton
            key={action.label}
            variant={action.variant}
            onClick={() => runBulk(action.toStatus)}
            disabled={selectedCount === 0}
            pending={isBulkPending}
            pendingLabel={action.pendingLabel}
            className="w-full sm:w-auto"
          >
            {action.label}
          </PendingButton>
        ))}
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
