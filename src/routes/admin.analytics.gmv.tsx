import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsGmvBody, AnalyticsSectionShell } from "@/components/admin/AnalyticsSection";

export const Route = createFileRoute("/admin/analytics/gmv")({
  head: () => ({ meta: [{ title: "Analytics GMV — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  return (
    <AnalyticsSectionShell active="/admin/analytics/gmv" title="GMV" description="Gross merchandise volume trends.">
      {(data, loading) => <AnalyticsGmvBody data={data} loading={loading} />}
    </AnalyticsSectionShell>
  );
}
