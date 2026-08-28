import { createFileRoute } from "@tanstack/react-router";
import { AdminRecordDetailPage } from "@/components/admin/AdminRecordPage";

export const Route = createFileRoute("/admin/listings/$id/edit")({
  head: () => ({ meta: [{ title: "Listings Id Edit — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <AdminRecordDetailPage domain="brand" id={id} />;
}
