import { createFileRoute } from "@tanstack/react-router";
import { CaseDetailPage } from "@/components/admin/CaseDetailPage";

export const Route = createFileRoute("/admin/fraud-cases/$id")({
  head: () => ({ meta: [{ title: "Fraud case — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <CaseDetailPage id={id} domain="fraud" title="Fraud case" listPath="/admin/fraud-cases" listLabel="Fraud cases" />;
}
