import { createFileRoute } from "@tanstack/react-router";
import { MerchantsTiersPage } from "@/components/admin/merchants/MerchantsTiersPage";

export const Route = createFileRoute("/admin/merchants/tiers")({
  head: () => ({ meta: [{ title: "Tiers & limits — MagnetPay Admin" }] }),
  component: MerchantsTiersPage,
});
