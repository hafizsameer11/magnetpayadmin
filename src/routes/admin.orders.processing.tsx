import { createFileRoute } from "@tanstack/react-router";
import { StatusPage } from "@/components/admin/Orders";

export const Route = createFileRoute("/admin/orders/processing")({
  head: () => ({ meta: [{ title: "Processing — MagnetPay Admin" }] }),
  component: () => <StatusPage status="processing" title="Processing" description="Paid and funded into escrow — seller is preparing the shipment." />,
});
