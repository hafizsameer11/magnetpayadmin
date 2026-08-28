import { createFileRoute } from "@tanstack/react-router";
import { AdminRecordListPage } from "@/components/admin/AdminRecordPage";

export const Route = createFileRoute("/admin/tickets/")({
  head: () => ({ meta: [{ title: "Tickets Index — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  return <AdminRecordListPage domain="ticket" />;
}
