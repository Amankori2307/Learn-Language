import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useDashboardViewModel } from "@/features/dashboard/use-dashboard-view-model";
import { DashboardPageSkeleton, SurfaceMessage } from "@/components/ui/page-states";
import { DashboardOverview } from "@/features/dashboard/dashboard-overview";

export default function Dashboard() {
  const { isLoading, isError, retry, userName, stats, primaryMode, primaryLabel, coreActions, bucketCards } =
    useDashboardViewModel();

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
      <DashboardOverview
        userName={userName}
        stats={s}
        primaryMode={primaryMode}
        primaryLabel={primaryLabel}
        coreActions={coreActions}
        bucketCards={bucketCards}
      />
    </Layout>
  );
}
