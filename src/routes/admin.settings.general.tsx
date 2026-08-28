import { createFileRoute } from "@tanstack/react-router";
import { AdminRecordListPage } from "@/components/admin/AdminRecordPage";

export const Route = createFileRoute("/admin/settings/general")({
  head: () => ({ meta: [{ title: "Settings General — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  return <AdminRecordListPage domain="feature-flag" />;
}
