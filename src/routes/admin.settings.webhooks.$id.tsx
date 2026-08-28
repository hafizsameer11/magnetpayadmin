import { createFileRoute } from "@tanstack/react-router";
import { AdminRecordDetailPage } from "@/components/admin/AdminRecordPage";

export const Route = createFileRoute("/admin/settings/webhooks/$id")({
  head: () => ({ meta: [{ title: "Settings Webhooks Id — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <AdminRecordDetailPage domain="webhook" id={id} />;
}
