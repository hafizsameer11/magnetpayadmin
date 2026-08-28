import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsOverviewBody, AnalyticsSectionShell } from "@/components/admin/AnalyticsSection";

export const Route = createFileRoute("/admin/analytics/overview")({
  head: () => ({ meta: [{ title: "Analytics overview — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  return (
    <AnalyticsSectionShell active="/admin/analytics/overview" title="Overview" description="Platform KPIs from live data.">
      {(data, loading) => <AnalyticsOverviewBody data={data} loading={loading} />}
    </AnalyticsSectionShell>
  );
}
