import { createFileRoute } from "@tanstack/react-router";
import { MerchantsDirectoryPage } from "@/components/admin/merchants/MerchantsDirectoryPage";

export const Route = createFileRoute("/admin/merchants/directory")({
  head: () => ({ meta: [{ title: "Agent directory — MagnetPay Admin" }] }),
  component: MerchantsDirectoryPage,
});
