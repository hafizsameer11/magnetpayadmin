import { createFileRoute } from "@tanstack/react-router";
import { FxRatesPage } from "@/components/admin/FxRates";

export const Route = createFileRoute("/admin/fx/rates")({
  head: () => ({ meta: [{ title: "FX rates — MagnetPay Admin" }] }),
  component: FxRatesPage,
});
