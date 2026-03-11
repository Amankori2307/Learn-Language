import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuizDirectionEnum } from "@shared/domain/enums";

type AttemptRow = {
  id: number;
  isCorrect: boolean;
  direction: QuizDirectionEnum | null;
  confidenceLevel?: number | null;
  responseTimeMs?: number | null;
  createdAt?: string | null;
  word: {
    transliteration: string;
    originalScript: string;
    english: string;
  };
};

function toLabel(direction: QuizDirectionEnum | null) {
  if (direction === QuizDirectionEnum.SOURCE_TO_TARGET) return "Source Language -> English";
  if (direction === QuizDirectionEnum.TARGET_TO_SOURCE) return "English -> Source Language";
  return "Mixed";
}

function formatWhen(value: string | null | undefined) {
  if (!value) return "Unknown time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString();
}

export function HistoryResultsTable({
  pageAttempts,
  currentPage,
  totalPages,
  totalResults,
  setPage,
}: {
  pageAttempts: AttemptRow[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
      <div className="grid grid-cols-12 gap-3 border-b border-border/60 bg-secondary/30 px-4 py-3 text-xs font-semibold text-muted-foreground">
        <div className="col-span-3 md:col-span-2">Result</div>
        <div className="col-span-9 md:col-span-4">Word</div>
        <div className="hidden md:col-span-2 md:block">Direction</div>
        <div className="hidden md:col-span-1 md:block">Confidence</div>
        <div className="hidden md:col-span-1 md:block">Time</div>
        <div className="col-span-12 md:col-span-2">When</div>
      </div>
      <div className="divide-y divide-border/50">
        {pageAttempts.map((attempt) => (
          <div key={attempt.id} className="grid grid-cols-12 items-center gap-3 px-4 py-3">
            <div className="col-span-3 md:col-span-2">
              <Badge
                variant={attempt.isCorrect ? "default" : "destructive"}
                className={attempt.isCorrect ? "bg-emerald-600 hover:bg-emerald-600" : ""}
              >
                {attempt.isCorrect ? "Correct" : "Wrong"}
              </Badge>
            </div>
            <div className="col-span-9 min-w-0 md:col-span-4">
              <p className="truncate font-medium">
                {attempt.word.transliteration} ({attempt.word.originalScript})
              </p>
              <p className="truncate text-sm text-muted-foreground">{attempt.word.english}</p>
            </div>
            <div className="hidden text-sm text-muted-foreground md:col-span-2 md:block">
              {toLabel(attempt.direction)}
            </div>
            <div className="hidden text-sm md:col-span-1 md:block">
              {attempt.confidenceLevel ?? "-"}
            </div>
            <div className="hidden text-sm text-muted-foreground md:col-span-1 md:block">
              {attempt.responseTimeMs ? `${Math.round(attempt.responseTimeMs / 1000)}s` : "-"}
            </div>
            <div className="col-span-12 text-sm text-muted-foreground md:col-span-2">
              {formatWhen(attempt.createdAt)}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-border/50 bg-secondary/20 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Page {currentPage} of {totalPages} • {totalResults} results
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
