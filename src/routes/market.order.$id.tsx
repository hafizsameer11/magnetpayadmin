import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/market/order/$id")({
  component: () => <Outlet />,
});
