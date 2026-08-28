import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsFunnelsBody, AnalyticsSectionShell } from "@/components/admin/AnalyticsSection";

export const Route = createFileRoute("/admin/analytics/funnels")({
  head: () => ({ meta: [{ title: "Analytics Funnels — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  return (
    <AnalyticsSectionShell active="/admin/analytics/funnels" title="Funnels" description="Conversion through checkout and KYC.">
      {() => <AnalyticsFunnelsBody />}
    </AnalyticsSectionShell>
  );
}
