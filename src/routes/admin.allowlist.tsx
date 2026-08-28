import { createFileRoute } from "@tanstack/react-router";
import { AdminRecordListPage } from "@/components/admin/AdminRecordPage";

export const Route = createFileRoute("/admin/allowlist")({
  head: () => ({ meta: [{ title: "Allowlist — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  return <AdminRecordListPage domain="allowlist" />;
}
