import { createFileRoute } from "@tanstack/react-router";
import { OrderStatusPage } from "@/components/admin/OrderStatusPage";

export const Route = createFileRoute("/admin/orders/processing")({
  head: () => ({ meta: [{ title: "Processing orders — MagnetPay Admin" }] }),
  component: () => (
    <OrderStatusPage
      status="processing"
      title="Processing"
      description="Paid orders being prepared for shipment."
    />
  ),
});
