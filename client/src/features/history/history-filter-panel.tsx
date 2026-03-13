import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuizDirectionEnum } from "@shared/domain/enums";
import { useLearningLanguage } from "@/hooks/use-language";
import type {
  HistoryDirectionFilter,
  HistoryResultFilter,
  HistorySortOption,
} from "@/features/history/use-history-page-view-model";

export function HistoryFilterPanel({
  search,
  setSearch,
  resultFilter,
  setResultFilter,
  directionFilter,
  setDirectionFilter,
  sortBy,
  setSortBy,
  applyFilterReset,
}: {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  resultFilter: HistoryResultFilter;
  setResultFilter: React.Dispatch<React.SetStateAction<HistoryResultFilter>>;
  directionFilter: HistoryDirectionFilter;
  setDirectionFilter: React.Dispatch<React.SetStateAction<HistoryDirectionFilter>>;
  sortBy: HistorySortOption;
  setSortBy: React.Dispatch<React.SetStateAction<HistorySortOption>>;
  applyFilterReset: <T>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => void;
}) {
  const { languageLabel } = useLearningLanguage();

  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border/50 bg-card p-4 md:grid-cols-4 md:p-6">
      <div className="space-y-1 md:col-span-2">
        <Label htmlFor="history-search">Search</Label>
        <Input
          id="history-search"
          value={search}
          onChange={(event) => applyFilterReset(setSearch, event.target.value)}
          placeholder="Search by word, transliteration, meaning"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="history-result">Result</Label>
        <select
          id="history-result"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={resultFilter}
          onChange={(event) =>
            applyFilterReset(setResultFilter, event.target.value as HistoryResultFilter)
          }
        >
          <option value="all">All</option>
          <option value="correct">Correct</option>
          <option value="wrong">Wrong</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="history-direction">Direction</Label>
        <select
          id="history-direction"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={directionFilter}
          onChange={(event) =>
            applyFilterReset(setDirectionFilter, event.target.value as HistoryDirectionFilter)
          }
        >
          <option value="all">All</option>
          <option value={QuizDirectionEnum.SOURCE_TO_TARGET}>
            {languageLabel} -&gt; English
          </option>
          <option value={QuizDirectionEnum.TARGET_TO_SOURCE}>
            English -&gt; {languageLabel}
          </option>
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="history-sort">Sort</Label>
        <select
          id="history-sort"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={sortBy}
          onChange={(event) => applyFilterReset(setSortBy, event.target.value as HistorySortOption)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="confidence_desc">System signal (High first)</option>
          <option value="response_time_desc">Slowest first</option>
        </select>
      </div>
    </div>
  );
}
