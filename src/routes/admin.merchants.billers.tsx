import { createFileRoute } from "@tanstack/react-router";
import { MerchantsBillersPage } from "@/components/admin/merchants/MerchantsBillersPage";

export const Route = createFileRoute("/admin/merchants/billers")({
  head: () => ({ meta: [{ title: "Billers — MagnetPay Admin" }] }),
  component: MerchantsBillersPage,
});
