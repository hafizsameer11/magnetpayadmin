import { createFileRoute } from "@tanstack/react-router";
import { StatusPage } from "@/components/admin/Orders";

export const Route = createFileRoute("/admin/orders/cancelled")({
  head: () => ({ meta: [{ title: "Cancelled — MagnetPay Admin" }] }),
  component: () => <StatusPage status="cancelled" title="Cancelled" description="Cancelled by buyer, seller, or admin. All funds returned." />,
});
