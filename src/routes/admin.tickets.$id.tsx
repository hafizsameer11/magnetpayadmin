import { createFileRoute } from "@tanstack/react-router";
import { AdminRecordDetailPage } from "@/components/admin/AdminRecordPage";

export const Route = createFileRoute("/admin/tickets/$id")({
  head: () => ({ meta: [{ title: "Tickets Id — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <AdminRecordDetailPage domain="ticket" id={id} />;
}
