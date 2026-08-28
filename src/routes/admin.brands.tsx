import { createFileRoute } from "@tanstack/react-router";
import { BrandsListPage } from "@/components/admin/DomainListPages";

export const Route = createFileRoute("/admin/brands")({
  head: () => ({ meta: [{ title: "Brands — MagnetPay Admin" }] }),
  component: BrandsListPage,
});
