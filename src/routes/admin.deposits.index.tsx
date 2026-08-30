import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownToLine, Clock, CheckCircle2, XCircle } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { FilterTabs, KpiStrip, ListEmpty, ListToolbar } from "@/components/admin/ListPageKit";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminDeposits, fmtMoney } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/deposits/")({
  head: () => ({ meta: [{ title: "Deposits — MagnetPay Admin" }] }),
  component: Page,
});

type Tone = "success" | "warn" | "danger" | "info" | "neutral";
type StatusTab = "all" | "pending" | "completed" | "failed";

function str(v: unknown, fallback = "—") {
  if (v == null) return fallback;
  return String(v);
}

function statusOf(raw: unknown) {
  return str((raw as Record<string, unknown>).status).toUpperCase();
}

function toneFor(status: string): Tone {
  const s = status.toUpperCase();
  if (s === "SUCCEEDED" || s === "COMPLETED" || s === "APPROVED") return "success";
  if (s === "PENDING" || s === "PROCESSING") return "warn";
  if (s === "FAILED" || s === "REJECTED") return "danger";
  return "neutral";
}

function isPending(s: string) {
  return s === "PENDING" || s === "PROCESSING";
}

function isCompleted(s: string) {
  return s === "SUCCEEDED" || s === "COMPLETED" || s === "APPROVED";
}

function Page() {
  const [rows, setRows] = useState<unknown[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<StatusTab>("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await fetchAdminDeposits());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load deposits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const counts = useMemo(() => {
    const pending = rows.filter((r) => isPending(statusOf(r))).length;
    const completed = rows.filter((r) => isCompleted(statusOf(r))).length;
    const failed = rows.filter((r) => statusOf(r) === "FAILED" || statusOf(r) === "REJECTED").length;
    return { total: rows.length, pending, completed, failed };
  }, [rows]);

  const filtered = rows.filter((raw) => {
    const s = statusOf(raw);
    if (tab === "pending" && !isPending(s)) return false;
    if (tab === "completed" && !isCompleted(s)) return false;
    if (tab === "failed" && s !== "FAILED" && s !== "REJECTED") return false;
    if (!query) return true;
    const r = raw as Record<string, unknown>;
    const user = (r.user ?? {}) as Record<string, unknown>;
    const q = query.toLowerCase();
    return (
      str(r.id).toLowerCase().includes(q) ||
      str(user.name).toLowerCase().includes(q) ||
      str(user.phone).includes(q) ||
      str(r.method).toLowerCase().includes(q)
    );
  });

  return (
    <AdminShell
      title="Deposits"
      description="Inbound funds across bank transfer, card, and corridor rails."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Money" }, { label: "Deposits" }]}
    >
      <KpiStrip
        items={[
          { label: "Total deposits", value: loading ? "…" : counts.total, Icon: ArrowDownToLine, tone: T.navy, delta: "All time" },
          { label: "Pending", value: loading ? "…" : counts.pending, Icon: Clock, tone: T.warn, delta: "Awaiting settlement" },
          { label: "Completed", value: loading ? "…" : counts.completed, Icon: CheckCircle2, tone: T.success, delta: "Credited to wallets" },
          { label: "Failed", value: loading ? "…" : counts.failed, Icon: XCircle, tone: T.danger, delta: "Needs follow-up" },
        ]}
      />

      <ListToolbar query={query} onQueryChange={setQuery} placeholder="ID, user, method…" onRefresh={() => void load()} refreshing={loading}>
        <FilterTabs
          active={tab}
          onChange={(id) => setTab(id as StatusTab)}
          tabs={[
            { id: "all", label: "All", count: counts.total },
            { id: "pending", label: "Pending", count: counts.pending },
            { id: "completed", label: "Completed", count: counts.completed },
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
            gridTemplateColumns: "1.1fr 1.6fr 1fr 1.2fr 1fr 1.2fr",
          }}
        >
          <span>ID</span>
          <span>User</span>
          <span className="text-right">Amount</span>
          <span>Method</span>
          <span>Status</span>
          <span>When</span>
        </div>
        {filtered.map((raw, i) => {
          const r = raw as Record<string, unknown>;
          const user = (r.user ?? {}) as Record<string, unknown>;
          const id = str(r.id);
          const status = str(r.status);
          return (
            <div
              key={id}
              className="grid items-center px-4 h-[58px] text-[12px]"
              style={{
                gridTemplateColumns: "1.1fr 1.6fr 1fr 1.2fr 1fr 1.2fr",
                borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <Link
                to="/admin/deposits/$id"
                params={{ id }}
                className="font-bold tabular-nums hover:underline"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: T.navy }}
              >
                {id.slice(0, 8)}
              </Link>
              <div className="min-w-0">
                <p className="font-medium truncate">{str(user.name)}</p>
                <p className="text-[10.5px] tabular-nums truncate" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {str(user.phone)}
                </p>
              </div>
              <span className="text-right tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtMoney(str(r.currency, "NGN"), r.amountMinor as string | number)}
              </span>
              <span className="truncate text-[11px]" style={{ color: T.sub }}>
                {str(r.method)}
              </span>
              <Pill tone={toneFor(status)}>{status}</Pill>
              <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {r.createdAt ? new Date(String(r.createdAt)).toLocaleString() : "—"}
              </span>
            </div>
          );
        })}
        {!filtered.length ? <ListEmpty message="No deposits match this filter." /> : null}
      </div>
    </AdminShell>
  );
}
