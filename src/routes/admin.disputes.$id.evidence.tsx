import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { DisputeEvidencePanel, DisputeHeader } from "@/components/admin/DisputeProfile";
import { fetchAdminDisputes, type AdminDispute } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/disputes/$id/evidence")({
  head: () => ({ meta: [{ title: "Dispute evidence — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<AdminDispute | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchAdminDisputes()
      .then((list) => setRow(list.find((d) => d.id === id) ?? null))
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Failed to load");
        setRow(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AdminShell title="Evidence" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Disputes", to: "/admin/disputes" }, { label: id.slice(0, 8) }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="Evidence" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Disputes", to: "/admin/disputes" }, { label: id.slice(0, 8) }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>Dispute not found.</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title=" " breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Disputes", to: "/admin/disputes" }, { label: row.id.slice(0, 8) }, { label: "Evidence" }]}>
      <DisputeHeader row={row} />
      <DisputeEvidencePanel row={row} />
    </AdminShell>
  );
}
