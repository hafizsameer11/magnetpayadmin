import { createFileRoute } from "@tanstack/react-router";
import { TicketDetailPage } from "@/components/admin/CaseDetailPage";

export const Route = createFileRoute("/admin/tickets/$id")({
  head: () => ({ meta: [{ title: "Support ticket — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <TicketDetailPage id={id} />;
}
