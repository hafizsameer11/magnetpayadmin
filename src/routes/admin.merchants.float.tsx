import { createFileRoute } from "@tanstack/react-router";
import { MerchantsFloatPage } from "@/components/admin/merchants/MerchantsFloatPage";

export const Route = createFileRoute("/admin/merchants/float")({
  head: () => ({ meta: [{ title: "Float — MagnetPay Admin" }] }),
  component: MerchantsFloatPage,
});
