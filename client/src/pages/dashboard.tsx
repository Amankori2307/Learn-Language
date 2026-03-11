import { Layout } from "@/components/layout";
import { useDashboardViewModel } from "@/features/dashboard/use-dashboard-view-model";
import { DashboardPageSkeleton } from "@/components/ui/page-states";
import { DashboardOverview } from "@/features/dashboard/dashboard-overview";

export default function Dashboard() {
  const { isLoading, userName, stats, primaryMode, primaryLabel, coreActions, bucketCards } =
    useDashboardViewModel();

  if (isLoading) {
    return (
      <Layout>
        <DashboardPageSkeleton />
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
