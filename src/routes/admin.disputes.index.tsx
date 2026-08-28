import { createFileRoute } from "@tanstack/react-router";
import { DisputesListPage } from "@/components/admin/DomainListPages";

export const Route = createFileRoute("/admin/disputes/")({
  head: () => ({ meta: [{ title: "Disputes — MagnetPay Admin" }] }),
  component: DisputesListPage,
});
