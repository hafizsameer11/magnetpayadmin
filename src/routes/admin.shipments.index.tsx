import { createFileRoute } from "@tanstack/react-router";
import { ShipmentsListPage } from "@/components/admin/DomainListPages";

export const Route = createFileRoute("/admin/shipments/")({
  head: () => ({ meta: [{ title: "Shipments — MagnetPay Admin" }] }),
  component: ShipmentsListPage,
});
