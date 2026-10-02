import { createFileRoute } from "@tanstack/react-router";
import { MerchantsTransactionsPage } from "@/components/admin/merchants/MerchantsTransactionsPage";

export const Route = createFileRoute("/admin/merchants/transactions/")({
  head: () => ({ meta: [{ title: "Merchant transactions — MagnetPay Admin" }] }),
  component: MerchantsTransactionsPage,
});
