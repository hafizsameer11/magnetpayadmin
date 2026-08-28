import { createFileRoute } from "@tanstack/react-router";
import { AdminRecordDetailPage } from "@/components/admin/AdminRecordPage";

export const Route = createFileRoute("/admin/reports/$id")({
  head: () => ({ meta: [{ title: "Reports Id — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <AdminRecordDetailPage domain="incident" id={id} />;
}
