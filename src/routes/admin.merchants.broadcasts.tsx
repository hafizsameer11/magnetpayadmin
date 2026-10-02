import { createFileRoute } from "@tanstack/react-router";
import { MerchantsBroadcastsPage } from "@/components/admin/merchants/MerchantsBroadcastsPage";

export const Route = createFileRoute("/admin/merchants/broadcasts")({
  head: () => ({ meta: [{ title: "Broadcasts — MagnetPay Admin" }] }),
  component: MerchantsBroadcastsPage,
});
