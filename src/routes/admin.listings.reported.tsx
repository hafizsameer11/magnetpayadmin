import { createFileRoute } from "@tanstack/react-router";
import { ListingsFilterPage } from "@/components/admin/ListingsFilterPage";

export const Route = createFileRoute("/admin/listings/reported")({
  head: () => ({ meta: [{ title: "Reported listings — MagnetPay Admin" }] }),
  component: () => <ListingsFilterPage mode="reported" />,
});
