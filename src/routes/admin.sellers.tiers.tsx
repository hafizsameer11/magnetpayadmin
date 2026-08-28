import { createFileRoute } from "@tanstack/react-router";
import { SellerTiersPage } from "@/components/admin/DomainListPages";

export const Route = createFileRoute("/admin/sellers/tiers")({
  head: () => ({ meta: [{ title: "Sellers Tiers — MagnetPay Admin" }] }),
  component: SellerTiersPage,
});
