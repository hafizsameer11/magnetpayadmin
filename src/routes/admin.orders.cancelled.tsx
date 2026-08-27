import { createFileRoute } from "@tanstack/react-router";
import { OrderStatusPage } from "@/components/admin/OrderStatusPage";

export const Route = createFileRoute("/admin/orders/cancelled")({
  head: () => ({ meta: [{ title: "Cancelled orders — MagnetPay Admin" }] }),
  component: () => (
    <OrderStatusPage
      status="cancelled"
      title="Cancelled"
      description="Orders cancelled by buyer, seller, or admin."
    />
  ),
});
