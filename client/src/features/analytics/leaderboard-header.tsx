import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

type WindowOption = {
  key: string;
  label: string;
};

export function LeaderboardHeader({
  window,
  setWindow,
  options,
  isFetching,
}: {
  window: string;
  setWindow: (value: string) => void;
  options: WindowOption[];
  isFetching: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Trophy className="h-7 w-7 text-amber-500" />
          Leaderboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Track top learners by XP, streak, and accuracy.
        </p>
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
