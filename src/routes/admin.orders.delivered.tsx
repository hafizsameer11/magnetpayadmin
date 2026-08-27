import { createFileRoute } from "@tanstack/react-router";
import { OrderStatusPage } from "@/components/admin/OrderStatusPage";

export const Route = createFileRoute("/admin/orders/delivered")({
  head: () => ({ meta: [{ title: "Delivered orders — MagnetPay Admin" }] }),
  component: () => (
    <OrderStatusPage
      status="delivered"
      title="Delivered"
      description="Orders confirmed delivered to the buyer."
    />
  ),
});
