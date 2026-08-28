import { createFileRoute } from "@tanstack/react-router";
import { AdminRecordDetailPage } from "@/components/admin/AdminRecordPage";

export const Route = createFileRoute("/admin/records/$id")({
  validateSearch: (s: Record<string, unknown>): { domain?: string } => ({
    domain: typeof s.domain === "string" ? s.domain : "incident",
  }),
  head: () => ({ meta: [{ title: "Record — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { domain = "incident" } = Route.useSearch();
  return <AdminRecordDetailPage domain={domain} id={id} />;
}
