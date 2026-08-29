import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/carriers/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/logistics/partners" });
  },
  component: () => null,
});
