import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useDashboardViewModel } from "@/features/dashboard/use-dashboard-view-model";
import { DashboardPageSkeleton, SurfaceMessage } from "@/components/ui/page-states";
import { DashboardOverview } from "@/features/dashboard/dashboard-overview";
import { useLearningLanguage } from "@/hooks/use-language";

export default function Dashboard() {
  const { isLoading, isError, retry, stats, primaryMode, primaryLabel, coreActions, bucketCards } =
    useDashboardViewModel();
  const { languageLabel } = useLearningLanguage();

  if (isLoading) {
    return (
      <Layout>
        <DashboardPageSkeleton />
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <SurfaceMessage
          title="Could not load dashboard"
          description="The dashboard request failed before progress data could be shown."
          tone="error"
          action={
            <Button variant="outline" onClick={retry}>
              Retry
            </Button>
          }
        />
      </Layout>
    );
  }

  const s = stats;

  return (
    <Layout>
      <div className="mb-4 rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm text-muted-foreground md:hidden">
        Learning language: <span className="font-semibold text-foreground">{languageLabel}</span>
      </div>
      <DashboardOverview
        stats={s}
        primaryMode={primaryMode}
        primaryLabel={primaryLabel}
        coreActions={coreActions}
        bucketCards={bucketCards}
      />
    </Layout>
  );
}
