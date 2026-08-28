import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsSectionShell, AnalyticsUsersBody } from "@/components/admin/AnalyticsSection";

export const Route = createFileRoute("/admin/analytics/users")({
  head: () => ({ meta: [{ title: "Analytics Users — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  return (
    <AnalyticsSectionShell active="/admin/analytics/users" title="Users" description="Buyer growth and engagement.">
      {() => <AnalyticsUsersBody />}
    </AnalyticsSectionShell>
  );
}
