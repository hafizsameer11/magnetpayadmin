import { createFileRoute } from "@tanstack/react-router";
import { MerchantDetailPage } from "@/components/admin/merchants/MerchantDetailPage";

export const Route = createFileRoute("/admin/merchants/$id")({
  validateSearch: (s: Record<string, unknown>): { tab?: string } => ({
    tab: typeof s.tab === "string" ? s.tab : "overview",
  }),
  head: () => ({ meta: [{ title: "Merchant — MagnetPay Admin" }] }),
  component: function MerchantDetailRoute() {
    const { id } = Route.useParams();
    const { tab } = Route.useSearch();
    return <MerchantDetailPage id={id} tab={tab} />;
  },
});
