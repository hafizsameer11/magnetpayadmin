import { createFileRoute } from "@tanstack/react-router";
import { MerchantsSettlementsPage } from "@/components/admin/merchants/MerchantsSettlementsPage";

export const Route = createFileRoute("/admin/merchants/settlements")({
  head: () => ({ meta: [{ title: "Settlements — MagnetPay Admin" }] }),
  component: MerchantsSettlementsPage,
});
