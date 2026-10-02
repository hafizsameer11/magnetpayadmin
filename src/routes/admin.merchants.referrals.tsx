import { createFileRoute } from "@tanstack/react-router";
import { MerchantsReferralsPage } from "@/components/admin/merchants/MerchantsReferralsPage";

export const Route = createFileRoute("/admin/merchants/referrals")({
  head: () => ({ meta: [{ title: "Referrals — MagnetPay Admin" }] }),
  component: MerchantsReferralsPage,
});
