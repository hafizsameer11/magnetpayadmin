import { createFileRoute } from "@tanstack/react-router";
import { OrderStatusPage } from "@/components/admin/OrderStatusPage";

export const Route = createFileRoute("/admin/orders/pending")({
  head: () => ({ meta: [{ title: "Pending orders — MagnetPay Admin" }] }),
  component: () => (
    <OrderStatusPage
      status="pending"
      title="Pending payment"
      description="Orders placed but not yet paid."
    />
  ),
});
