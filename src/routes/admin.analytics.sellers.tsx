import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsSectionShell, AnalyticsSellersBody } from "@/components/admin/AnalyticsSection";

export const Route = createFileRoute("/admin/analytics/sellers")({
  head: () => ({ meta: [{ title: "Analytics Sellers — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  return (
    <AnalyticsSectionShell active="/admin/analytics/sellers" title="Sellers" description="Supplier activity on the marketplace.">
      {() => <AnalyticsSellersBody />}
    </AnalyticsSectionShell>
  );
}
