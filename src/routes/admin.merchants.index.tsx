import { createFileRoute } from "@tanstack/react-router";
import { MerchantsOverviewPage } from "@/components/admin/merchants/MerchantsOverviewPage";

export const Route = createFileRoute("/admin/merchants/")({
  head: () => ({ meta: [{ title: "Merchants — MagnetPay Admin" }] }),
  component: MerchantsOverviewPage,
});
