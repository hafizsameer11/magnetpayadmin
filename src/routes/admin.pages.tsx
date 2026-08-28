import { createFileRoute } from "@tanstack/react-router";
import { AdminRecordListPage } from "@/components/admin/AdminRecordPage";

export const Route = createFileRoute("/admin/pages")({
  head: () => ({ meta: [{ title: "Pages — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  return <AdminRecordListPage domain="legal-page" />;
}
