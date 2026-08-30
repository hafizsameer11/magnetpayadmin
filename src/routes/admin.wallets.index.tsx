import { createFileRoute } from "@tanstack/react-router";
import { WalletListPage } from "@/components/admin/WalletListPage";

export const Route = createFileRoute("/admin/wallets/")({
  head: () => ({ meta: [{ title: "Wallets — MagnetPay Admin" }] }),
  component: WalletListPage,
});
