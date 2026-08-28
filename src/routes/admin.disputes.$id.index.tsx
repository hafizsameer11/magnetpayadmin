import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Card } from "@/components/admin/Catalog";
import { DisputeEvidencePanel, DisputeHeader, DisputeRulingPanel } from "@/components/admin/DisputeProfile";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminDispute, fmtMoney, resolveEscrow, type AdminDispute } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/disputes/$id/")({
  head: () => ({ meta: [{ title: "Dispute detail — MagnetPay Admin" }] }),
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
    setLoading(true);
    try {
      setRow(await fetchAdminDispute(id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load dispute");
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
      toast.success(`Escrow resolved: ${outcome}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Resolve failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Dispute" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Disputes", to: "/admin/disputes" }, { label: id.slice(0, 8) }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="Dispute" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Disputes", to: "/admin/disputes" }, { label: id.slice(0, 8) }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>Dispute not found.</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title=" " breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Disputes", to: "/admin/disputes" }, { label: row.id.slice(0, 8) }]}>
      <DisputeHeader row={row} />
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <DisputeEvidencePanel row={row} />
          <DisputeRulingPanel row={row} outcome={outcome} setOutcome={setOutcome} onSubmit={(e) => void onResolve(e)} busy={busy} />
        </div>
        <div className="space-y-4">
          <Card>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: T.muted }}>
              Opened by
            </p>
            <p className="font-semibold">{row.openedBy?.name ?? "—"}</p>
          </Card>
          {row.escrow ? (
            <Card>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: T.muted }}>
                Escrow held
              </p>
              <p className="font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtMoney(row.escrow.currency, row.escrow.amountMinor)}
              </p>
              <Pill tone="info">{row.escrow.status}</Pill>
            </Card>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}
