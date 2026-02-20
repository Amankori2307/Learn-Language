import { Layout } from "@/components/layout";
import { useLeaderboard, type LeaderboardWindow } from "@/hooks/use-leaderboard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";
import { useState } from "react";

function initials(firstName: string | null, lastName: string | null, email: string | null) {
  const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  if (name) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? "")
      .join("");
  }
  return (email?.[0] ?? "U").toUpperCase();
}

const WINDOW_OPTIONS: Array<{ key: LeaderboardWindow; label: string }> = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "all_time", label: "All Time" },
];

export default function LeaderboardPage() {
  const [window, setWindow] = useState<LeaderboardWindow>("weekly");
  const { data, isLoading, isError, refetch, isFetching } = useLeaderboard(window, 25);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="w-7 h-7 text-amber-500" />
              Leaderboard
            </h1>
            <p className="text-muted-foreground mt-1">Track top learners by XP, streak, and accuracy.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {WINDOW_OPTIONS.map((option) => (
              <Button
                key={option.key}
                variant={option.key === window ? "default" : "outline"}
                onClick={() => setWindow(option.key)}
                disabled={isFetching}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-border/50 bg-card p-8 text-center text-muted-foreground">
            Loading leaderboard...
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-red-700 font-medium">Failed to load leaderboard.</p>
            <Button variant="outline" className="mt-3" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-card p-8 text-center text-muted-foreground">
            No leaderboard data yet. Complete quiz attempts to appear here.
          </div>
        ) : (
          <>
            <div className="md:hidden space-y-3">
              {data.map((entry) => (
                <div
                  key={entry.userId}
                  className={cn(
                    "rounded-2xl border border-border/50 bg-card p-4",
                    entry.rank <= 3 && "bg-amber-50/40",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={entry.profileImageUrl ?? undefined} />
                        <AvatarFallback>{initials(entry.firstName, entry.lastName, entry.email)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {[entry.firstName, entry.lastName].filter(Boolean).join(" ") || entry.email || "Learner"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">#{entry.rank} • {entry.attempts} attempts</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">{entry.xp} XP</p>
                      <p className="text-xs text-muted-foreground">{entry.streak}d • {entry.accuracy}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block rounded-2xl border border-border/50 bg-card overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border/50">
                <div className="col-span-1">Rank</div>
                <div className="col-span-5">Learner</div>
                <div className="col-span-2 text-right">XP</div>
                <div className="col-span-2 text-right">Streak</div>
                <div className="col-span-2 text-right">Accuracy</div>
              </div>
              {data.map((entry) => (
                <div
                  key={entry.userId}
                  className={cn(
                    "grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-border/30 last:border-b-0",
                    entry.rank <= 3 && "bg-amber-50/30",
                  )}
                >
                  <div className="col-span-1 font-bold text-lg">#{entry.rank}</div>
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={entry.profileImageUrl ?? undefined} />
                      <AvatarFallback>{initials(entry.firstName, entry.lastName, entry.email)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {[entry.firstName, entry.lastName].filter(Boolean).join(" ") || entry.email || "Learner"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{entry.attempts} attempts</p>
                    </div>
                  </div>
                  <div className="col-span-2 text-right font-semibold">{entry.xp}</div>
                  <div className="col-span-2 text-right">{entry.streak}d</div>
                  <div className="col-span-2 text-right">{entry.accuracy}%</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
