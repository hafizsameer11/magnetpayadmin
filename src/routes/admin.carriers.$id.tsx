import { createFileRoute } from "@tanstack/react-router";
import { CarrierDetailPage } from "@/components/admin/CaseDetailPage";

export const Route = createFileRoute("/admin/carriers/$id")({
  head: () => ({ meta: [{ title: "Carrier — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <CarrierDetailPage id={id} />;
}
