import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/carriers/$id")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/logistics/partners" });
  },
  component: () => null,
});
