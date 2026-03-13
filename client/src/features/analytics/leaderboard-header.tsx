import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import type { LeaderboardWindow } from "@/hooks/use-leaderboard";
import type { LeaderboardEntry } from "./leaderboard-panel";

type WindowOption = {
  key: LeaderboardWindow;
  label: string;
};

export function LeaderboardHeader({
  window,
  setWindow,
  options,
  isFetching,
  currentUserEntry,
}: {
  window: LeaderboardWindow;
  setWindow: React.Dispatch<React.SetStateAction<LeaderboardWindow>>;
  options: WindowOption[];
  isFetching: boolean;
  currentUserEntry: LeaderboardEntry | null;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Trophy className="h-7 w-7 text-status-warning" />
          Leaderboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Track top learners by XP, streak, and accuracy.
        </p>
        {currentUserEntry ? (
          <p className="mt-2 text-sm font-medium text-foreground">
            Your rank: #{currentUserEntry.rank} • {currentUserEntry.xp} XP • {currentUserEntry.accuracy}%
          </p>
        ) : null}
      </div>
      <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
        {options.map((option) => (
          <Button
            key={option.key}
            variant={option.key === window ? "default" : "outline"}
            onClick={() => setWindow(option.key)}
            disabled={isFetching}
            className="w-full sm:w-auto"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
