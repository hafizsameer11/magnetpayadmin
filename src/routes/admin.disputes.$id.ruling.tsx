import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { DisputeHeader, DisputeRulingPanel } from "@/components/admin/DisputeProfile";
import { fetchAdminDispute, resolveEscrow, type AdminDispute } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/disputes/$id/ruling")({
  head: () => ({ meta: [{ title: "Dispute ruling — MagnetPay Admin" }] }),
  component: Page,
});

const OUTCOMES = ["RELEASE_TO_SELLER", "REFUND_TO_BUYER", "SPLIT"] as const;

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<AdminDispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState<string>(OUTCOMES[0]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setRow(await fetchAdminDispute(id));
    } catch {
      setRow(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const onResolve = async (e: FormEvent) => {
    e.preventDefault();
    if (!row || busy) return;
    setBusy(true);
    try {
      await resolveEscrow(row.escrowId, outcome);
      toast.success(`Ruling applied: ${outcome}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Resolve failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Ruling" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Disputes", to: "/admin/disputes" }, { label: id.slice(0, 8) }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="Ruling" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Disputes", to: "/admin/disputes" }, { label: id.slice(0, 8) }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>Dispute not found.</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title=" " breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Disputes", to: "/admin/disputes" }, { label: row.id.slice(0, 8) }, { label: "Ruling" }]}>
      <DisputeHeader row={row} />
      <DisputeRulingPanel row={row} outcome={outcome} setOutcome={setOutcome} onSubmit={(e) => void onResolve(e)} busy={busy} />
    </AdminShell>
  );
}
