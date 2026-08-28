import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsFxBody, AnalyticsSectionShell } from "@/components/admin/AnalyticsSection";

export const Route = createFileRoute("/admin/analytics/fx")({
  head: () => ({ meta: [{ title: "Analytics FX — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  return (
    <AnalyticsSectionShell active="/admin/analytics/fx" title="FX" description="Corridor conversion and spread metrics.">
      {(data, loading) => <AnalyticsFxBody data={data} loading={loading} />}
    </AnalyticsSectionShell>
  );
}
