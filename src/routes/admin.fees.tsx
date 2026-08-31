import { createFileRoute } from "@tanstack/react-router";
import { FeeSchedulePage } from "@/components/admin/FeeSchedule";

export const Route = createFileRoute("/admin/fees")({
  head: () => ({ meta: [{ title: "Fees — MagnetPay Admin" }] }),
  component: FeeSchedulePage,
});
