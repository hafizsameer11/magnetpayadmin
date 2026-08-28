import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsCohortsBody, AnalyticsSectionShell } from "@/components/admin/AnalyticsSection";

export const Route = createFileRoute("/admin/analytics/cohorts")({
  head: () => ({ meta: [{ title: "Analytics Cohorts — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  return (
    <AnalyticsSectionShell active="/admin/analytics/cohorts" title="Cohorts" description="Retention by signup month.">
      {(data, loading) => <AnalyticsCohortsBody data={data} loading={loading} />}
    </AnalyticsSectionShell>
  );
}
