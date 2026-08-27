import { createFileRoute } from "@tanstack/react-router";
import { StatusPage } from "@/components/admin/Orders";

export const Route = createFileRoute("/admin/orders/shipped")({
  head: () => ({ meta: [{ title: "Shipped — MagnetPay Admin" }] }),
  component: () => <StatusPage status="shipped" title="Shipped" description="Handed to carrier and in transit to the buyer's country." />,
});
