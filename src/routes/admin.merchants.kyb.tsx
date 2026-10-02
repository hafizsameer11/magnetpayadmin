import { createFileRoute } from "@tanstack/react-router";
import { MerchantsKybPage } from "@/components/admin/merchants/MerchantsKybPage";

export const Route = createFileRoute("/admin/merchants/kyb")({
  head: () => ({ meta: [{ title: "Merchant KYB — MagnetPay Admin" }] }),
  component: MerchantsKybPage,
});
