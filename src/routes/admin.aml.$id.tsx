import { createFileRoute } from "@tanstack/react-router";
import { AmlDetailPage } from "@/components/admin/CaseDetailPage";

export const Route = createFileRoute("/admin/aml/$id")({
  head: () => ({ meta: [{ title: "AML case — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <AmlDetailPage id={id} />;
}
