import { createFileRoute } from "@tanstack/react-router";
import { MerchantsDisputesPage } from "@/components/admin/merchants/MerchantsDisputesPage";

export const Route = createFileRoute("/admin/merchants/disputes")({
  head: () => ({ meta: [{ title: "Merchant disputes — MagnetPay Admin" }] }),
  component: MerchantsDisputesPage,
});
