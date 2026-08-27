import { createFileRoute } from "@tanstack/react-router";
import { StatusPage } from "@/components/admin/Orders";

export const Route = createFileRoute("/admin/orders/refunded")({
  head: () => ({ meta: [{ title: "Refunded — MagnetPay Admin" }] }),
  component: () => <StatusPage status="refunded" title="Refunded" description="Full or partial refund issued. See refund reason on the order." />,
});
