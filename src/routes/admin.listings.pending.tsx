import { createFileRoute } from "@tanstack/react-router";
import { ListingsFilterPage } from "@/components/admin/ListingsFilterPage";

export const Route = createFileRoute("/admin/listings/pending")({
  head: () => ({ meta: [{ title: "Pending listings — MagnetPay Admin" }] }),
  component: () => <ListingsFilterPage mode="pending" />,
});
