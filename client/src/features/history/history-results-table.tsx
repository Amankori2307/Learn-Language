import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuizDirectionEnum } from "@shared/domain/enums";
import { useLearningLanguage } from "@/hooks/use-language";

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

function toLabel(direction: QuizDirectionEnum | null, languageLabel: string) {
  if (direction === QuizDirectionEnum.SOURCE_TO_TARGET) return `${languageLabel} -> English`;
  if (direction === QuizDirectionEnum.TARGET_TO_SOURCE) return `English -> ${languageLabel}`;
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
  const { languageLabel } = useLearningLanguage();

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
      <div className="hidden grid-cols-12 gap-3 border-b border-border/60 bg-secondary/30 px-4 py-3 text-xs font-semibold text-muted-foreground md:grid">
        <div className="col-span-3 md:col-span-2">Result</div>
        <div className="col-span-9 md:col-span-4">Word</div>
        <div className="hidden md:col-span-2 md:block">Direction</div>
        <div className="hidden md:col-span-1 md:block">Confidence</div>
        <div className="hidden md:col-span-1 md:block">Time</div>
        <div className="col-span-12 md:col-span-2">When</div>
      </div>
      <div className="space-y-3 p-4 md:hidden">
        {pageAttempts.map((attempt) => (
          <div key={attempt.id} className="rounded-xl border border-border/50 bg-background/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{attempt.word.transliteration}</p>
                <p className="mt-1 text-xs text-muted-foreground">{attempt.word.originalScript}</p>
                <p className="mt-1 text-sm text-muted-foreground">{attempt.word.english}</p>
              </div>
              <Badge
                variant={attempt.isCorrect ? "secondary" : "destructive"}
                className={
                  attempt.isCorrect
                    ? "border-[hsl(var(--status-success-border))] bg-[hsl(var(--status-success))] text-[hsl(var(--status-success-foreground))] hover:bg-[hsl(var(--status-success))]"
                    : ""
                }
              >
                {attempt.isCorrect ? "Correct" : "Wrong"}
              </Badge>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Direction:</span>{" "}
                {toLabel(attempt.direction, languageLabel)}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Confidence:</span>{" "}
                {attempt.confidenceLevel ?? "-"}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Time:</span>{" "}
                {attempt.responseTimeMs ? `${Math.round(attempt.responseTimeMs / 1000)}s` : "-"}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">When:</span>{" "}
                {formatWhen(attempt.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden divide-y divide-border/50 md:block">
        {pageAttempts.map((attempt) => (
          <div key={attempt.id} className="grid grid-cols-12 items-center gap-3 px-4 py-3">
            <div className="col-span-3 md:col-span-2">
              <Badge
                variant={attempt.isCorrect ? "secondary" : "destructive"}
                className={
                  attempt.isCorrect
                    ? "border-[hsl(var(--status-success-border))] bg-[hsl(var(--status-success))] text-[hsl(var(--status-success-foreground))] hover:bg-[hsl(var(--status-success))]"
                    : ""
                }
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
              {toLabel(attempt.direction, languageLabel)}
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
      <div className="flex flex-col gap-3 border-t border-border/50 bg-secondary/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Page {currentPage} of {totalPages} • {totalResults} results
        </p>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
            className="w-full sm:w-auto"
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages}
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
