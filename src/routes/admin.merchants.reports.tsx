import { createFileRoute } from "@tanstack/react-router";
import { MerchantsReportsPage } from "@/components/admin/merchants/MerchantsReportsPage";

export const Route = createFileRoute("/admin/merchants/reports")({
  head: () => ({ meta: [{ title: "Merchant reports — MagnetPay Admin" }] }),
  component: MerchantsReportsPage,
});
