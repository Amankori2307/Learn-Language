import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { buildAvatarUrl } from "@/lib/avatar";
import { useLeaderboard } from "@/hooks/use-leaderboard";

type LeaderboardEntry = NonNullable<ReturnType<typeof useLeaderboard>["data"]>[number];

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

function avatarFor(entry: {
  profileImageUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}) {
  return buildAvatarUrl({
    profileImageUrl: entry.profileImageUrl,
    firstName: entry.firstName,
    lastName: entry.lastName,
    email: entry.email,
  });
}

export function LeaderboardPanel({
  entries,
}: {
  entries: LeaderboardEntry[];
}) {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {entries.map((entry) => (
          <div
            key={entry.userId}
            className={cn(
              "rounded-2xl border border-border/50 bg-card p-4",
              entry.rank <= 3 && "bg-amber-50/40",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarFor(entry)} />
                  <AvatarFallback>
                    {initials(entry.firstName, entry.lastName, entry.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {[entry.firstName, entry.lastName].filter(Boolean).join(" ") ||
                      entry.email ||
                      "Learner"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    #{entry.rank} • {entry.attempts} attempts
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-semibold">{entry.xp} XP</p>
                <p className="text-xs text-muted-foreground">
                  {entry.streak}d • {entry.accuracy}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-border/50 bg-card md:block">
        <div className="grid grid-cols-12 gap-2 border-b border-border/50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <div className="col-span-1">Rank</div>
          <div className="col-span-5">Learner</div>
          <div className="col-span-2 text-right">XP</div>
          <div className="col-span-2 text-right">Streak</div>
          <div className="col-span-2 text-right">Accuracy</div>
        </div>
        {entries.map((entry) => (
          <div
            key={entry.userId}
            className={cn(
              "grid grid-cols-12 items-center gap-2 border-b border-border/30 px-4 py-3 last:border-b-0",
              entry.rank <= 3 && "bg-amber-50/30",
            )}
          >
            <div className="col-span-1 text-lg font-bold">#{entry.rank}</div>
            <div className="col-span-5 flex min-w-0 items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={avatarFor(entry)} />
                <AvatarFallback>
                  {initials(entry.firstName, entry.lastName, entry.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {[entry.firstName, entry.lastName].filter(Boolean).join(" ") ||
                    entry.email ||
                    "Learner"}
                </p>
                <p className="truncate text-xs text-muted-foreground">{entry.attempts} attempts</p>
              </div>
            </div>
            <div className="col-span-2 text-right font-semibold">{entry.xp}</div>
            <div className="col-span-2 text-right">{entry.streak}d</div>
            <div className="col-span-2 text-right">{entry.accuracy}%</div>
          </div>
        ))}
      </div>
    </>
  );
}
