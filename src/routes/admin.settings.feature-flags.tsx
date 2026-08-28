import { createFileRoute } from "@tanstack/react-router";
import { AdminRecordListPage } from "@/components/admin/AdminRecordPage";

export const Route = createFileRoute("/admin/settings/feature-flags")({
  head: () => ({ meta: [{ title: "Settings Feature-flags — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  return <AdminRecordListPage domain="feature-flag" />;
}
