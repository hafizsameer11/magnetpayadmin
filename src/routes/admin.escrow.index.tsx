import { createFileRoute } from "@tanstack/react-router";
import { EscrowListPage } from "@/components/admin/DomainListPages";

export const Route = createFileRoute("/admin/escrow/")({
  head: () => ({ meta: [{ title: "Escrow contracts — MagnetPay Admin" }] }),
  component: () => <EscrowListPage />,
});
