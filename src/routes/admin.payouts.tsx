import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminWithdrawals, fmtMoney } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/payouts")({
  head: () => ({ meta: [{ title: "Payouts — MagnetPay Admin" }] }),
  component: Page,
});

type Tone = "success" | "warn" | "danger" | "info" | "neutral";

type Row = {
  id: string;
  status: string;
  currency: string;
  amountMinor: string | number;
  createdAt: string;
  destination?: string;
  rail?: string;
  user?: { id: string; name: string; phone: string };
};

function toneFor(status: string): Tone {
  const s = status.toUpperCase();
  if (s === "SUCCEEDED" || s === "APPROVED") return "success";
  if (s === "PENDING" || s === "PROCESSING") return "warn";
  if (s === "FAILED" || s === "REJECTED") return "danger";
  return "neutral";
}

function Page() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    void fetchAdminWithdrawals()
      .then((data) => setRows(data as Row[]))
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load payouts"));
  }, []);

  // Seller payouts reuse withdrawals (outbound). Show all; empty when API has none.
  const payouts = rows;

  return (
    <AdminShell
      title="Seller payouts"
      description="Outbound withdrawals used as the payout queue until a dedicated payouts API exists."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Money" }, { label: "Payouts" }]}
      actions={
        <Link to="/admin/withdrawals" className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center" style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}>
          Open withdrawals
        </Link>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Payouts", val: payouts.length },
          {
            label: "Pending / processing",
            val: payouts.filter((r) => {
              const s = r.status.toUpperCase();
              return s === "PENDING" || s === "PROCESSING";
            }).length,
            tone: T.warn,
          },
          {
            label: "Succeeded",
            val: payouts.filter((r) => r.status.toUpperCase() === "SUCCEEDED").length,
            tone: T.success,
          },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
              {s.label}
            </p>
            <p className="mt-2 text-[20px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: s.tone ?? T.ink }}>
              {s.val}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "1.1fr 1.5fr 1fr 1.2fr 1fr 1.2fr",
          }}
        >
          <span>ID</span>
          <span>Recipient</span>
          <span className="text-right">Amount</span>
          <span>Destination</span>
          <span>Status</span>
          <span>When</span>
        </div>
        {payouts.map((w, i) => (
          <div
            key={w.id}
            className="grid items-center px-4 h-[56px] text-[12px]"
            style={{
              gridTemplateColumns: "1.1fr 1.5fr 1fr 1.2fr 1fr 1.2fr",
              borderBottom: i < payouts.length - 1 ? `1px solid ${T.border}` : "none",
            }}
          >
            <Link
              to="/admin/withdrawals/$id"
              params={{ id: w.id }}
              className="font-bold tabular-nums hover:underline"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: T.navy }}
            >
              {w.id.slice(0, 8)}
            </Link>
            <span className="truncate">{w.user?.name ?? "—"}</span>
            <span className="text-right tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {fmtMoney(w.currency, w.amountMinor)}
            </span>
            <span className="truncate text-[11px]" style={{ color: T.sub }}>
              {w.destination ?? w.rail ?? "—"}
            </span>
            <Pill tone={toneFor(w.status)}>{w.status}</Pill>
            <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
              {w.createdAt ? new Date(w.createdAt).toLocaleString() : "—"}
            </span>
          </div>
        ))}
        {!payouts.length ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No payouts yet.
          </p>
        ) : null}
      </div>
    </AdminShell>
  );
}
