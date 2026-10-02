import { createFileRoute } from "@tanstack/react-router";
import { MerchantTxDetailPage } from "@/components/admin/merchants/MerchantsTransactionsPage";

export const Route = createFileRoute("/admin/merchants/transactions/$ref")({
  head: () => ({ meta: [{ title: "Transaction — MagnetPay Admin" }] }),
  component: function TxDetailRoute() {
    const { ref } = Route.useParams();
    return <MerchantTxDetailPage refId={ref} />;
  },
});
