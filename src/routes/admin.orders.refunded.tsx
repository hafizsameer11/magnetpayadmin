import { createFileRoute } from "@tanstack/react-router";
import { OrderStatusPage } from "@/components/admin/OrderStatusPage";

export const Route = createFileRoute("/admin/orders/refunded")({
  head: () => ({ meta: [{ title: "Refunded orders — MagnetPay Admin" }] }),
  component: () => (
    <OrderStatusPage
      status="refunded"
      title="Refunded"
      description="Orders with full or partial refunds issued."
    />
  ),
});
