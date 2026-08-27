import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminDisputes, fmtMoney, resolveEscrow, type AdminDispute } from "@/lib/api";
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
      const list = await fetchAdminDisputes();
      const found = list.find((d) => d.id === id) ?? null;
      setRow(found);
      if (!found) toast.error("Dispute not found");
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
      <AdminShell
        title="Dispute"
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Disputes", to: "/admin/disputes" }, { label: id }]}
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
        title="Dispute"
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Disputes", to: "/admin/disputes" }, { label: id }]}
      >
        <p className="text-[13px]" style={{ color: T.muted }}>
          Dispute not found.
        </p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={`Dispute ${row.id.slice(0, 8)}`}
      description={row.reason}
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Disputes", to: "/admin/disputes" },
        { label: row.id.slice(0, 8) },
      ]}
      actions={
        <Link
          to="/admin/disputes"
          className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5"
          style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
        >
          <ArrowLeft className="size-3.5" /> Back
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2 mb-3">
              {row.outcome ? <Pill tone="success">{row.outcome}</Pill> : <Pill tone="warn">Open</Pill>}
              <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {new Date(row.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-[13px] font-semibold" style={{ color: T.ink }}>
              {row.reason}
            </p>
            {row.evidence != null && (
              <pre
                className="mt-3 p-3 rounded-lg text-[11px] overflow-auto max-h-48"
                style={{ background: T.bg, border: `1px solid ${T.border}`, fontFamily: "'JetBrains Mono', monospace" }}
              >
                {JSON.stringify(row.evidence, null, 2)}
              </pre>
            )}
          </div>

          {!row.outcome && (
            <form
              onSubmit={(e) => void onResolve(e)}
              className="rounded-xl p-4 space-y-3"
              style={{ background: T.surface, border: `1px solid ${T.border}` }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                Resolve escrow
              </p>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full h-9 px-3 rounded-lg text-[12px] outline-none"
                style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
              >
                {OUTCOMES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={busy}
                className="h-9 px-3 rounded-lg text-[12px] font-bold text-white disabled:opacity-60"
                style={{ background: T.navy }}
              >
                {busy ? "Resolving…" : "Resolve escrow"}
              </button>
            </form>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
              Opened by
            </p>
            <p className="mt-1.5 font-semibold">{row.openedBy?.name ?? "—"}</p>
            {row.openedBy && (
              <Link
                to="/admin/users/$id"
                params={{ id: row.openedBy.id }}
                className="text-[11px] tabular-nums hover:underline"
                style={{ color: T.info, fontFamily: "'JetBrains Mono', monospace" }}
              >
                {row.openedBy.id.slice(0, 8)}
              </Link>
            )}
          </div>

          <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
              Escrow
            </p>
            {row.escrow ? (
              <>
                <p className="mt-1.5 font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {fmtMoney(row.escrow.currency, row.escrow.amountMinor)}
                </p>
                <Pill tone="info">{row.escrow.status}</Pill>
              </>
            ) : null}
            <Link
              to="/admin/escrow/$id"
              params={{ id: row.escrowId }}
              className="mt-2 block text-[11.5px] tabular-nums hover:underline"
              style={{ color: T.info, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {row.escrowId.slice(0, 8)}
            </Link>
          </div>
        </div>
      </div>
      <Outlet />
    </AdminShell>
  );
}
