import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill, initials } from "@/components/admin/UserProfile";
import { fetchAdminEscrow, fmtMoney, resolveEscrow, type AdminEscrow } from "@/lib/api";
import { EscrowMilestones } from "@/components/admin/DisputeProfile";

export const Route = createFileRoute("/admin/escrow/$id")({
  head: () => ({ meta: [{ title: "Escrow detail — MagnetPay Admin" }] }),
  component: Page,
});

const OUTCOMES = ["RELEASE_TO_SELLER", "REFUND_TO_BUYER", "SPLIT"] as const;

function statusTone(status: string): "success" | "warn" | "danger" | "info" | "neutral" {
  const s = status.toUpperCase();
  if (s === "RELEASED" || s === "COMPLETED") return "success";
  if (s === "DISPUTED") return "danger";
  if (s === "FUNDED" || s === "PENDING" || s === "ACTIVE") return "warn";
  return "info";
}

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<AdminEscrow | null>(null);
  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState<string>(OUTCOMES[0]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setRow(await fetchAdminEscrow(id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load escrow");
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
      await resolveEscrow(row.id, outcome);
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
        title="Escrow"
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Escrow", to: "/admin/escrow" }, { label: id }]}
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
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Escrow", to: "/admin/escrow" }, { label: id }]}
      >
        <p className="text-[13px]" style={{ color: T.muted }}>
          Escrow not found.
        </p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={`Escrow ${row.id.slice(0, 8)}`}
      description={row.title || "Escrow contract detail"}
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Escrow", to: "/admin/escrow" },
        { label: row.id.slice(0, 8) },
      ]}
      actions={
        <Link
          to="/admin/escrow"
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                  Status
                </p>
                <div className="mt-1.5">
                  <Pill tone={statusTone(row.status)}>{row.status}</Pill>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                  Amount
                </p>
                <p className="text-[18px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {fmtMoney(row.currency, row.amountMinor)}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 pt-3" style={{ borderTop: `1px solid ${T.border}` }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                  Created
                </p>
                <p className="text-[12px] tabular-nums mt-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.sub }}>
                  {new Date(row.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
                  Disputes
                </p>
                <p className="text-[12px] font-bold tabular-nums mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {row.disputes?.length ?? 0}
                </p>
              </div>
            </div>
          </div>

          <EscrowMilestones
            milestones={(row.milestones ?? []) as { label?: string; name?: string; status?: string; amountMinor?: string | number; releasedMinor?: string | number }[]}
            totalMinor={row.amountMinor}
            currency={row.currency}
          />

          {(row.disputes?.length ?? 0) > 0 ? (
            <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: T.muted }}>
                Disputes
              </p>
              <ul className="space-y-2">
                {row.disputes!.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between p-3 rounded-lg text-[12px]"
                    style={{ background: T.bg, border: `1px solid ${T.border}` }}
                  >
                    <span className="tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {d.id.slice(0, 8)}
                    </span>
                    <span style={{ color: T.sub }}>{d.outcome ?? "Open"}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: T.muted }}>
              Resolve escrow
            </p>
            <form onSubmit={onResolve} className="flex flex-col sm:flex-row gap-2">
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="flex-1 h-9 px-3 rounded-md text-[12px] outline-none"
                style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
                disabled={busy}
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
                className="h-9 px-4 rounded-md text-[12px] font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-60"
                style={{ background: T.navy }}
              >
                {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
                {busy ? "Resolving…" : "Resolve"}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          {row.buyer ? (
            <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: T.muted }}>
                Buyer
              </p>
              <div className="flex items-center gap-2.5">
                <div
                  className="size-8 rounded-full grid place-items-center text-[10.5px] font-bold"
                  style={{ background: `${T.navy}10`, color: T.navy }}
                >
                  {initials(row.buyer.name || "?")}
                </div>
                <div>
                  <p className="font-semibold text-[12px]">{row.buyer.name}</p>
                  <Link
                    to="/admin/users/$id"
                    params={{ id: row.buyer.id }}
                    className="text-[11px] tabular-nums hover:underline"
                    style={{ color: T.info, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {row.buyer.id.slice(0, 8)}
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          {row.seller ? (
            <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: T.muted }}>
                Seller
              </p>
              <div className="flex items-center gap-2.5">
                <div
                  className="size-8 rounded-full grid place-items-center text-[10.5px] font-bold"
                  style={{ background: `${T.navy}10`, color: T.navy }}
                >
                  {initials(row.seller.name || "?")}
                </div>
                <div>
                  <p className="font-semibold text-[12px]">{row.seller.name}</p>
                  <Link
                    to="/admin/users/$id"
                    params={{ id: row.seller.id }}
                    className="text-[11px] tabular-nums hover:underline"
                    style={{ color: T.info, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {row.seller.id.slice(0, 8)}
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}
