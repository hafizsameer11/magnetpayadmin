import { createFileRoute } from "@tanstack/react-router";
import { MerchantsAuditPage } from "@/components/admin/merchants/MerchantsAuditPage";

export const Route = createFileRoute("/admin/merchants/audit")({
  head: () => ({ meta: [{ title: "Merchant audit — MagnetPay Admin" }] }),
  component: MerchantsAuditPage,
});
