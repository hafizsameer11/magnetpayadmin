import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsLogisticsBody, AnalyticsSectionShell } from "@/components/admin/AnalyticsSection";

export const Route = createFileRoute("/admin/analytics/logistics")({
  head: () => ({ meta: [{ title: "Analytics Logistics — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  return (
    <AnalyticsSectionShell active="/admin/analytics/logistics" title="Logistics" description="Shipment pipeline health.">
      {(data, loading) => <AnalyticsLogisticsBody data={data} loading={loading} />}
    </AnalyticsSectionShell>
  );
}
