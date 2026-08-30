import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpFromLine, Clock, CheckCircle2, XCircle, Check, X } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { FilterTabs, KpiStrip, ListEmpty, ListToolbar } from "@/components/admin/ListPageKit";
import { Pill } from "@/components/admin/UserProfile";
import { decideWithdrawal, fetchAdminWithdrawals, fmtMoney } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/withdrawals/")({
  head: () => ({ meta: [{ title: "Withdrawals — MagnetPay Admin" }] }),
  component: Page,
});

type Tone = "success" | "warn" | "danger" | "info" | "neutral";
type StatusTab = "all" | "pending" | "approved" | "failed";

type Row = {
  id: string;
  status: string;
  currency: string;
  amountMinor: string | number;
  createdAt: string;
  destination?: string;
  rail?: string;
  providerRef?: string | null;
  user?: { id: string; name: string; phone: string };
};

function isPending(status: string) {
  const s = status.toUpperCase();
  return s === "PENDING" || s === "PROCESSING" || s === "REVIEW";
}

function isApproved(status: string) {
  const s = status.toUpperCase();
  return s === "SUCCEEDED" || s === "APPROVED";
}

function toneFor(status: string): Tone {
  const s = status.toUpperCase();
  if (isApproved(s)) return "success";
  if (isPending(s)) return "warn";
  if (s === "FAILED" || s === "REJECTED") return "danger";
  return "neutral";
}

function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<StatusTab>("pending");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminWithdrawals();
      setRows(data as Row[]);
    } catch {
      /* login required */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const counts = useMemo(() => {
    const pending = rows.filter((r) => isPending(r.status)).length;
    const approved = rows.filter((r) => isApproved(r.status)).length;
    const failed = rows.filter((r) => {
      const s = r.status.toUpperCase();
      return s === "FAILED" || s === "REJECTED";
    }).length;
    return { total: rows.length, pending, approved, failed };
  }, [rows]);

  const filtered = rows.filter((r) => {
    const s = r.status.toUpperCase();
    if (tab === "pending" && !isPending(r.status)) return false;
    if (tab === "approved" && !isApproved(r.status)) return false;
    if (tab === "failed" && s !== "FAILED" && s !== "REJECTED") return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      (r.user?.name ?? "").toLowerCase().includes(q) ||
      (r.user?.phone ?? "").includes(q) ||
      (r.destination ?? "").toLowerCase().includes(q)
    );
  });

  const decide = async (id: string, status: "APPROVED" | "REJECTED") => {
    setBusyId(id);
    try {
      await decideWithdrawal(id, status);
      toast.success(status === "APPROVED" ? "Withdrawal approved" : "Withdrawal rejected");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Decision failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminShell
      title="Withdrawals"
      description="Approval queue for outbound funds. Approve or reject pending requests."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Money" }, { label: "Withdrawals" }]}
    >
      <KpiStrip
        items={[
          { label: "Total requests", value: loading ? "…" : counts.total, Icon: ArrowUpFromLine, tone: T.navy, delta: "All time" },
          { label: "Awaiting decision", value: loading ? "…" : counts.pending, Icon: Clock, tone: T.warn, delta: "Needs admin action" },
          { label: "Approved / paid", value: loading ? "…" : counts.approved, Icon: CheckCircle2, tone: T.success, delta: "Settled outbound" },
          { label: "Failed / rejected", value: loading ? "…" : counts.failed, Icon: XCircle, tone: T.danger, delta: "Declined or errored" },
        ]}
      />

      <ListToolbar query={query} onQueryChange={setQuery} placeholder="ID, user, destination…" onRefresh={() => void load()} refreshing={loading}>
        <FilterTabs
          active={tab}
          onChange={(id) => setTab(id as StatusTab)}
          tabs={[
            { id: "all", label: "All", count: counts.total },
            { id: "pending", label: "Pending", count: counts.pending },
            { id: "approved", label: "Approved", count: counts.approved },
            { id: "failed", label: "Failed", count: counts.failed },
          ]}
        />
      </ListToolbar>

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "1.1fr 1.6fr 1fr 1.4fr 1fr 1.1fr 1.2fr",
          }}
        >
          <span>ID</span>
          <span>Holder</span>
          <span className="text-right">Amount</span>
          <span>Destination</span>
          <span>Status</span>
          <span>When</span>
          <span>Actions</span>
        </div>
        {filtered.map((w, i) => (
          <div
            key={w.id}
            className="grid items-center px-4 h-[58px] text-[12px]"
            style={{
              gridTemplateColumns: "1.1fr 1.6fr 1fr 1.4fr 1fr 1.1fr 1.2fr",
              borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
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
            <div className="min-w-0">
              <p className="font-medium truncate">{w.user?.name ?? "—"}</p>
              <p className="text-[10.5px] tabular-nums truncate" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                {w.user?.phone ?? w.user?.id?.slice(0, 8) ?? "—"}
              </p>
            </div>
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
            <div className="flex gap-1">
              {isPending(w.status) ? (
                <>
                  <button
                    disabled={busyId === w.id}
                    onClick={() => void decide(w.id, "APPROVED")}
                    className="size-7 grid place-items-center rounded-md text-white disabled:opacity-50"
                    style={{ background: T.success }}
                  >
                    <Check className="size-3.5" />
                  </button>
                  <button
                    disabled={busyId === w.id}
                    onClick={() => void decide(w.id, "REJECTED")}
                    className="size-7 grid place-items-center rounded-md text-white disabled:opacity-50"
                    style={{ background: T.danger }}
                  >
                    <X className="size-3.5" />
                  </button>
                </>
              ) : (
                <span style={{ color: T.muted }}>—</span>
              )}
            </div>
          </div>
        ))}
        {!filtered.length ? <ListEmpty message="No withdrawals match this filter." /> : null}
      </div>
    </AdminShell>
  );
}
