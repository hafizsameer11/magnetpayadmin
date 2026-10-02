import { createFileRoute } from "@tanstack/react-router";
import { MerchantsFeesPage } from "@/components/admin/merchants/MerchantsFeesPage";

export const Route = createFileRoute("/admin/merchants/fees")({
  head: () => ({ meta: [{ title: "Merchant fees — MagnetPay Admin" }] }),
  component: MerchantsFeesPage,
});
