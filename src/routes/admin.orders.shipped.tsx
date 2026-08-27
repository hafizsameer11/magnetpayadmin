import { createFileRoute } from "@tanstack/react-router";
import { OrderStatusPage } from "@/components/admin/OrderStatusPage";

export const Route = createFileRoute("/admin/orders/shipped")({
  head: () => ({ meta: [{ title: "Shipped orders — MagnetPay Admin" }] }),
  component: () => (
    <OrderStatusPage
      status="shipped"
      title="Shipped"
      description="Orders handed to carrier and in transit."
    />
  ),
});
