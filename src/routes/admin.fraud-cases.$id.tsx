import { createFileRoute } from "@tanstack/react-router";
import { AdminRecordDetailPage } from "@/components/admin/AdminRecordPage";

export const Route = createFileRoute("/admin/fraud-cases/$id")({
  head: () => ({ meta: [{ title: "Fraud-cases Id — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <AdminRecordDetailPage domain="fraud" id={id} />;
}
