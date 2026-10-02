import { createFileRoute } from "@tanstack/react-router";
import { MerchantsListPage } from "@/components/admin/merchants/MerchantsListPage";

export const Route = createFileRoute("/admin/merchants/list")({
  head: () => ({ meta: [{ title: "Merchants list — MagnetPay Admin" }] }),
  component: MerchantsListPage,
});
