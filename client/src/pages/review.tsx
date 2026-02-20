import { Layout } from "@/components/layout";
import { useMemo, useState } from "react";
import { useReviewQueue, useTransitionReview, useBulkTransitionReview, useReviewHistory, type ReviewStatus } from "@/hooks/use-review";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { UserTypeEnum } from "@shared/domain/enums";

const STATUS_OPTIONS: ReviewStatus[] = ["pending_review", "draft", "approved", "rejected"];
function formatDate(value?: string | null) {
  if (!value) return "n/a";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function ReviewPage() {
  const { user } = useAuth();
  const canReview = user?.role === UserTypeEnum.REVIEWER || user?.role === UserTypeEnum.ADMIN;

  const [status, setStatus] = useState<ReviewStatus>("pending_review");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeWordId, setActiveWordId] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");

  const { data, isLoading, isError, refetch } = useReviewQueue(status, 100);
  const history = useReviewHistory(activeWordId);
  const transition = useTransitionReview();
  const bulk = useBulkTransitionReview();

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  const runBulk = async (toStatus: ReviewStatus) => {
    if (selectedIds.length === 0) return;
    await bulk.mutateAsync({ ids: selectedIds, toStatus, notes: notes || undefined });
    setSelectedIds([]);
  };

  if (!canReview) {
    return (
      <Layout>
        <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
          <h1 className="text-2xl font-bold">Review Access Required</h1>
          <p className="text-muted-foreground mt-2">Only reviewer/admin roles can access vocabulary review tools.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Review Queue</h1>
            <p className="text-muted-foreground">Approve or reject vocabulary before learner exposure.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => (
              <Button key={s} variant={status === s ? "default" : "outline"} onClick={() => setStatus(s)}>
                {s}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-4 md:p-6 space-y-3">
          <Label htmlFor="review-notes">Review Notes (applied to bulk action)</Label>
          <Input
            id="review-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes for audit trail"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => runBulk("approved")} disabled={selectedIds.length === 0 || bulk.isPending}>
              Bulk Approve
            </Button>
            <Button variant="destructive" onClick={() => runBulk("rejected")} disabled={selectedIds.length === 0 || bulk.isPending}>
              Bulk Reject
            </Button>
            <Button variant="outline" onClick={() => setSelectedIds([])} disabled={selectedIds.length === 0}>
              Clear Selection
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{selectedIds.length} selected</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="p-4 border-b border-border/50 font-semibold">Queue Items</div>
            {isLoading ? (
              <div className="p-6 text-muted-foreground">Loading...</div>
            ) : isError ? (
              <div className="p-6">
                <p className="text-red-600">Failed to load queue.</p>
                <Button variant="outline" className="mt-3" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            ) : !data || data.length === 0 ? (
              <div className="p-6 text-muted-foreground">No items in this queue.</div>
            ) : (
              <div className="max-h-[560px] overflow-auto">
                {data.map((word) => (
                  <div
                    key={word.id}
                    className={`p-4 border-b border-border/30 last:border-b-0 ${activeWordId === word.id ? "bg-secondary/50" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedSet.has(word.id)}
                        onCheckedChange={() => toggleSelected(word.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{word.transliteration} ({word.telugu})</p>
                        <p className="text-sm text-muted-foreground">{word.english} • {word.partOfSpeech}</p>
                        <p className="text-xs text-muted-foreground mt-1">status: {word.reviewStatus}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          submitted: {word.submittedBy || "n/a"} • {formatDate(word.submittedAt)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          reviewed: {word.reviewedBy || "n/a"} • {formatDate(word.reviewedAt)}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" onClick={() => setActiveWordId(word.id)}>
                            View History
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => transition.mutate({ id: word.id, toStatus: "approved", notes: notes || undefined })}
                            disabled={transition.isPending}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => transition.mutate({ id: word.id, toStatus: "rejected", notes: notes || undefined })}
                            disabled={transition.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="p-4 border-b border-border/50 font-semibold">Review History</div>
            {!activeWordId ? (
              <div className="p-6 text-muted-foreground">Select an item to inspect source and transition history.</div>
            ) : history.isLoading ? (
              <div className="p-6 text-muted-foreground">Loading history...</div>
            ) : history.isError || !history.data ? (
              <div className="p-6 text-red-600">Failed to load history.</div>
            ) : (
              <div className="p-4 space-y-3 max-h-[560px] overflow-auto">
                <div className="rounded-xl border border-border/50 p-3">
                  <p className="font-medium">{history.data.word.transliteration} ({history.data.word.telugu})</p>
                  <p className="text-sm text-muted-foreground">{history.data.word.english}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Source: {history.data.word.sourceUrl ? (
                      <a className="underline" href={history.data.word.sourceUrl} target="_blank" rel="noreferrer">
                        {history.data.word.sourceUrl}
                      </a>
                    ) : "n/a"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Source captured: {formatDate(history.data.word.sourceCapturedAt)}
                  </p>
                </div>
                {history.data.events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No review events yet.</p>
                ) : (
                  history.data.events.map((event) => (
                    <div key={event.id} className="rounded-xl border border-border/40 p-3">
                      <p className="text-sm font-medium">
                        {event.fromStatus} {"->"} {event.toStatus}
                      </p>
                      <p className="text-xs text-muted-foreground">by {event.changedBy} • {formatDate(event.createdAt)}</p>
                      <p className="text-xs text-muted-foreground">
                        source: {event.sourceUrl ? (
                          <a className="underline" href={event.sourceUrl} target="_blank" rel="noreferrer">
                            {event.sourceUrl}
                          </a>
                        ) : "n/a"}
                        {" • "}captured: {formatDate(event.sourceCapturedAt)}
                      </p>
                      {event.notes && <p className="text-sm mt-1">{event.notes}</p>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
