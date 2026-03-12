import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { PlayCircle, Zap } from "lucide-react";
import type { useDashboardViewModel } from "@/features/dashboard/use-dashboard-view-model";

type DashboardViewModel = ReturnType<typeof useDashboardViewModel>;

export function DashboardOverview({
  stats,
  primaryMode,
  primaryLabel,
  coreActions,
  bucketCards,
}: Pick<
  DashboardViewModel,
  "stats" | "primaryMode" | "primaryLabel" | "coreActions" | "bucketCards"
>) {
  return (
    <Tabs defaultValue="learn" className="space-y-6">
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="learn" className="flex-1 sm:flex-none">
          Learn
        </TabsTrigger>
        <TabsTrigger value="progress" className="flex-1 sm:flex-none">
          Progress
        </TabsTrigger>
      </TabsList>

      <TabsContent value="learn" className="space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-4 sm:p-5 md:p-6">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          <div className="relative grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Primary Action
              </p>
              <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">Start Learning</h2>
              <p className="mt-2 text-muted-foreground">
                Tap the button to begin today’s learning flow. Answer the prompts, then confirm.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1">
                  {stats.streak} day streak
                </span>
                <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1">
                  {stats.mastered} mastered words
                </span>
              </div>
              <div className="mt-5 grid w-full grid-cols-1 gap-3 sm:flex sm:w-auto sm:flex-row">
                <Link href={`/quiz?mode=${primaryMode}`}>
                  <Button
                    size="lg"
                    className="w-full gap-2 sm:min-w-[var(--action-cluster-button-min-width)] sm:w-auto"
                  >
                    <PlayCircle className="h-5 w-5" />
                    {primaryLabel}
                  </Button>
                </Link>
                <Link href="/analytics" className="md:hidden">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:min-w-[var(--action-cluster-button-min-width)] sm:w-auto"
                  >
                    View Progress
                  </Button>
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4 sm:p-5">
              <p className="text-sm font-semibold text-foreground">What you’ll do next</p>
              <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-secondary text-xs font-semibold text-foreground">
                    1
                  </span>
                  <span>Start the session and read the prompt carefully.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-secondary text-xs font-semibold text-foreground">
                    2
                  </span>
                  <span>Select the best option for the translation.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-secondary text-xs font-semibold text-foreground">
                    3
                  </span>
                  <span>Confirm your answer to keep the streak alive.</span>
                </li>
              </ol>
            </div>
          </div>
        </section>
      </TabsContent>

      <TabsContent value="progress" className="space-y-6">
        <section className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Progress & Insights</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Track XP, buckets, and stable learning modes here.
              </p>
            </div>
            <Link href="/analytics">
              <Button
                size="sm"
                variant="outline"
                className="w-full sm:min-w-[var(--action-cluster-button-min-width)] sm:w-auto"
              >
                Open Analytics
              </Button>
            </Link>
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

        <section className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 md:p-6">
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
                className="flex min-h-[var(--surface-dashboard-card-min-height)] flex-col justify-between rounded-xl border border-border/60 bg-card p-4"
              >
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{action.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-muted-foreground">
                    {action.count} items
                  </span>
                  <Link href={action.href}>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      Open
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </TabsContent>
    </Tabs>
  );
}
