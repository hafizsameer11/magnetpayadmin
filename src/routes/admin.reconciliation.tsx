import { createFileRoute } from "@tanstack/react-router";
import { ReconciliationPage } from "@/components/admin/DomainListPages";

export const Route = createFileRoute("/admin/reconciliation")({
  head: () => ({ meta: [{ title: "Reconciliation — MagnetPay Admin" }] }),
  component: ReconciliationPage,
});
