import { Layout } from "@/components/layout";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlayCircle, Zap } from "lucide-react";
import { useDashboardViewModel } from "@/features/dashboard/use-dashboard-view-model";

export default function Dashboard() {
  const { isLoading, userName, stats, primaryMode, primaryLabel, coreActions, bucketCards } = useDashboardViewModel();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }
  const s = stats;

  return (
    <Layout>
      <div className="space-y-6">
        <section className="rounded-2xl border border-border/60 bg-card p-5 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Primary Action</p>
              <h1 className="text-3xl font-semibold mt-1">Start Learning</h1>
              <p className="text-muted-foreground mt-2">
                Welcome back, {userName}. Continue with the next recommended session.
              </p>
              <p className="text-sm text-muted-foreground mt-1">{s.streak} day streak • {s.mastered} mastered words</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/quiz?mode=${primaryMode}`}>
                <Button size="lg" className="min-w-[220px] gap-2">
                  <PlayCircle className="w-5 h-5" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total XP" value={s.xp} icon={Zap} color="accent" />
          {bucketCards.map((card) => (
            <div key={card.key} className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <h3 className="text-2xl font-semibold mt-1 tracking-tight">{card.value}</h3>
                </div>
                <div className="p-2.5 rounded-lg border bg-secondary text-foreground border-border">
                  <card.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">{card.meaning}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.improve}</p>
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
            <p className="text-sm text-muted-foreground mt-1">Only essential and stable learning flows are shown here.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {coreActions.map((action) => (
              <div key={action.title} className="rounded-xl border border-border/60 bg-card p-4 flex flex-col justify-between min-h-[200px]">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-secondary text-foreground flex items-center justify-center mb-3">
                    <action.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{action.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">
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
    </Layout>
  );
}
