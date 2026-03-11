import { PendingButton } from "@/components/ui/pending-button";

export function HistoryPageHeader({
  isFetching,
  refresh,
}: {
  isFetching: boolean;
  refresh: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Attempt history with filters, trends, and paginated drill-down.
        </p>
      </div>
      <PendingButton
        variant="outline"
        onClick={refresh}
        pending={isFetching}
        pendingLabel="Refreshing..."
        className="w-full sm:w-auto"
      >
        Refresh
      </PendingButton>
    </div>
  );
}
