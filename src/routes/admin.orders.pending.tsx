import { createFileRoute } from "@tanstack/react-router";
import { StatusPage } from "@/components/admin/Orders";

export const Route = createFileRoute("/admin/orders/pending")({
  head: () => ({ meta: [{ title: "Pending orders — MagnetPay Admin" }] }),
  component: () => <StatusPage status="pending" title="Pending payment" description="Orders placed but not yet paid. Auto-cancel after 24h." />,
});
