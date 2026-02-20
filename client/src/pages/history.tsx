import { Layout } from "@/components/layout";
import { useAttemptHistory } from "@/hooks/use-attempt-history";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function toLabel(direction: string | null) {
  if (direction === "telugu_to_english") return "Telugu -> English";
  if (direction === "english_to_telugu") return "English -> Telugu";
  return "Mixed";
}

function formatWhen(value: string | null) {
  if (!value) return "Unknown time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString();
}

export default function HistoryPage() {
  const history = useAttemptHistory(150);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Attempt History</h1>
            <p className="text-muted-foreground mt-1">
              Complete trail of your quiz attempts for tracking accuracy over time.
            </p>
          </div>
          <Button variant="outline" onClick={() => history.refetch()} disabled={history.isFetching}>
            {history.isFetching ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {history.isLoading ? (
          <div className="rounded-2xl border border-border/50 bg-card p-8 text-muted-foreground">Loading attempts...</div>
        ) : history.isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
            <p className="text-red-700 font-medium">Could not load attempt history.</p>
            <Button variant="outline" className="mt-3" onClick={() => history.refetch()}>
              Retry
            </Button>
          </div>
        ) : !history.data || history.data.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-card p-8 text-muted-foreground">
            No attempts yet. Start a quiz and your trail will appear here.
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-semibold text-muted-foreground border-b border-border/60 bg-secondary/30">
              <div className="col-span-3 md:col-span-2">Result</div>
              <div className="col-span-9 md:col-span-4">Word</div>
              <div className="hidden md:block md:col-span-2">Direction</div>
              <div className="hidden md:block md:col-span-1">Confidence</div>
              <div className="hidden md:block md:col-span-1">Time</div>
              <div className="col-span-12 md:col-span-2">When</div>
            </div>
            <div className="divide-y divide-border/50">
              {history.data.map((attempt) => (
                <div key={attempt.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center">
                  <div className="col-span-3 md:col-span-2">
                    <Badge
                      variant={attempt.isCorrect ? "default" : "destructive"}
                      className={attempt.isCorrect ? "bg-emerald-600 hover:bg-emerald-600" : ""}
                    >
                      {attempt.isCorrect ? "Correct" : "Wrong"}
                    </Badge>
                  </div>
                  <div className="col-span-9 md:col-span-4 min-w-0">
                    <p className="font-medium truncate">{attempt.word.transliteration} ({attempt.word.telugu})</p>
                    <p className="text-sm text-muted-foreground truncate">{attempt.word.english}</p>
                  </div>
                  <div className="hidden md:block md:col-span-2 text-sm text-muted-foreground">
                    {toLabel(attempt.direction)}
                  </div>
                  <div className="hidden md:block md:col-span-1 text-sm">
                    {attempt.confidenceLevel ?? "-"}
                  </div>
                  <div className="hidden md:block md:col-span-1 text-sm text-muted-foreground">
                    {attempt.responseTimeMs ? `${Math.round(attempt.responseTimeMs / 1000)}s` : "-"}
                  </div>
                  <div className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
                    {formatWhen(attempt.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
