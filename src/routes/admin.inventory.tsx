import { createFileRoute } from "@tanstack/react-router";
import { InventoryAlertsPage } from "@/components/admin/DomainListPages";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({ meta: [{ title: "Inventory — MagnetPay Admin" }] }),
  component: InventoryAlertsPage,
});
