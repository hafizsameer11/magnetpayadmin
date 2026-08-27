import { createFileRoute } from "@tanstack/react-router";
import { StatusPage } from "@/components/admin/Orders";

export const Route = createFileRoute("/admin/orders/delivered")({
  head: () => ({ meta: [{ title: "Delivered — MagnetPay Admin" }] }),
  component: () => <StatusPage status="delivered" title="Delivered" description="Confirmed delivered — escrow auto-releases 72h after confirmation." />,
});
