import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlayCircle, Zap } from "lucide-react";
import type { useDashboardViewModel } from "@/features/dashboard/use-dashboard-view-model";

type DashboardViewModel = ReturnType<typeof useDashboardViewModel>;

export function DashboardOverview({
  userName,
  stats,
  primaryMode,
  primaryLabel,
  coreActions,
  bucketCards,
}: Pick<
  DashboardViewModel,
  "userName" | "stats" | "primaryMode" | "primaryLabel" | "coreActions" | "bucketCards"
>) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/60 bg-card p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Primary Action
            </p>
            <h1 className="mt-1 text-3xl font-semibold">Start Learning</h1>
            <p className="mt-2 text-muted-foreground">
              Welcome back, {userName}. Continue with the next recommended session.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {stats.streak} day streak • {stats.mastered} mastered words
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={`/quiz?mode=${primaryMode}`}>
              <Button size="lg" className="min-w-[220px] gap-2">
                <PlayCircle className="h-5 w-5" />
                {primaryLabel}
              </Button>
            </Link>
            <Link href="/analytics">
              <Button size="lg" variant="outline" className="min-w-[220px]">
                Open Analytics
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total XP" value={stats.xp} icon={Zap} color="accent" />
        {bucketCards.map((card) => (
          <div key={card.key} className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight">{card.value}</h3>
              </div>
              <div className="rounded-lg border border-border bg-secondary p-2.5 text-foreground">
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{card.meaning}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.improve}</p>
            <Link href={`/analytics/words?bucket=${card.key}`}>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                View Words
              </Button>
            </Link>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-border/60 bg-card p-5 md:p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Core Modes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Only essential and stable learning flows are shown here.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {coreActions.map((action) => (
            <div
              key={action.title}
              className="flex min-h-[200px] flex-col justify-between rounded-xl border border-border/60 bg-card p-4"
            >
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                  <action.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{action.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-muted-foreground">
                  {action.count} items
                </span>
                <Link href={action.href}>
                  <Button variant="outline" size="sm">
                    Open
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
