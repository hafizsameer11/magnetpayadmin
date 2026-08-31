import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { EscrowDetailView } from "@/components/admin/EscrowDetail";
import { fetchAdminEscrow, type AdminEscrow } from "@/lib/api";

export const Route = createFileRoute("/admin/escrow/$id")({
  head: () => ({ meta: [{ title: "Escrow detail — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<AdminEscrow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRow(await fetchAdminEscrow(id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load escrow");
      setRow(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const reload = async () => {
    setBusy(true);
    try {
      await load();
    } finally {
      setBusy(false);
    }
  };

  const displayId = row ? (row.id.startsWith("ESC-") ? row.id : `ESC-${row.id.slice(0, 5).toUpperCase()}`) : id.slice(0, 8);

  if (loading) {
    return (
      <AdminShell
        title="Escrow"
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Escrow", to: "/admin/escrow" }, { label: displayId }]}
      >
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell
        title="Escrow"
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Escrow", to: "/admin/escrow" }, { label: displayId }]}
      >
        <p className="text-[13px]" style={{ color: T.muted }}>
          Escrow not found.
        </p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title=" "
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Escrow", to: "/admin/escrow" }, { label: displayId }]}
    >
      <EscrowDetailView row={row} busy={busy} onReload={reload} />
    </AdminShell>
  );
}
