import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, Clock, CheckCircle2, XCircle, Download, Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { FilterTabs, KpiStrip, ListEmpty, ListToolbar } from "@/components/admin/ListPageKit";
import { Pill } from "@/components/admin/UserProfile";
import { downloadTransfersCsv, fetchAdminTransfers, fmtMoney, type AdminTransfer } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/transactions/")({
  head: () => ({ meta: [{ title: "Transactions — MagnetPay Admin" }] }),
  component: Page,
});

type StatusTab = "all" | "pending" | "completed" | "failed";

function statusTone(status: string): "success" | "warn" | "danger" | "info" | "neutral" {
  const s = status.toUpperCase();
  if (s === "COMPLETED" || s === "SUCCESS" || s === "SETTLED") return "success";
  if (s === "PENDING" || s === "PROCESSING") return "warn";
  if (s === "FAILED" || s === "REJECTED") return "danger";
  return "info";
}

function isPending(s: string) {
  return s === "PENDING" || s === "PROCESSING";
}

function isCompleted(s: string) {
  return s === "COMPLETED" || s === "SUCCESS" || s === "SETTLED";
}

function Page() {
  const [rows, setRows] = useState<AdminTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<StatusTab>("all");

  const load = async () => {
    setLoading(true);
    try {
      setRows(await fetchAdminTransfers());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load transfers");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const onExport = async () => {
    setExporting(true);
    try {
      await downloadTransfersCsv();
      toast.success("CSV downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const counts = useMemo(() => {
    const pending = rows.filter((t) => isPending(t.status.toUpperCase())).length;
    const completed = rows.filter((t) => isCompleted(t.status.toUpperCase())).length;
    const failed = rows.filter((t) => {
      const s = t.status.toUpperCase();
      return s === "FAILED" || s === "REJECTED";
    }).length;
    return { total: rows.length, pending, completed, failed };
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((t) => {
      const s = t.status.toUpperCase();
      if (tab === "pending" && !isPending(s)) return false;
      if (tab === "completed" && !isCompleted(s)) return false;
      if (tab === "failed" && s !== "FAILED" && s !== "REJECTED") return false;
      if (!query.trim()) return true;
      const n = query.toLowerCase();
      return (
        t.id.toLowerCase().includes(n) ||
        (t.sender?.name ?? "").toLowerCase().includes(n) ||
        (t.recipient?.name ?? "").toLowerCase().includes(n) ||
        t.status.toLowerCase().includes(n)
      );
    });
  }, [rows, query, tab]);

  return (
    <AdminShell
      title="Transactions"
      description="Peer transfers and monetary movements across the platform."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Money" }, { label: "Transactions" }]}
      actions={
        <button
          type="button"
          onClick={() => void onExport()}
          disabled={exporting}
          className="h-9 px-3 rounded-lg text-[12px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
          style={{ background: T.navy, color: "#fff" }}
        >
          {exporting ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
          Export CSV
        </button>
      }
    >
      <KpiStrip
        items={[
          { label: "Total transfers", value: loading ? "…" : counts.total, Icon: ArrowLeftRight, tone: T.navy, delta: "All movements" },
          { label: "Pending", value: loading ? "…" : counts.pending, Icon: Clock, tone: T.warn, delta: "In flight" },
          { label: "Completed", value: loading ? "…" : counts.completed, Icon: CheckCircle2, tone: T.success, delta: "Settled" },
          { label: "Failed", value: loading ? "…" : counts.failed, Icon: XCircle, tone: T.danger, delta: "Needs review" },
        ]}
      />

      <ListToolbar query={query} onQueryChange={setQuery} placeholder="ID, sender, recipient…" onRefresh={() => void load()} refreshing={loading}>
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
            gridTemplateColumns: "0.9fr 1.4fr 1.4fr 1fr 0.9fr 1fr",
          }}
        >
          <span>ID</span>
          <span>Sender</span>
          <span>Recipient</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Date</span>
        </div>

        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <ListEmpty message="No transfers match this filter." />
        ) : (
          filtered.map((t, i) => (
            <div
              key={t.id}
              className="grid items-center px-4 h-[52px] text-[12px]"
              style={{
                gridTemplateColumns: "0.9fr 1.4fr 1.4fr 1fr 0.9fr 1fr",
                borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <Link
                to="/admin/transactions/$id"
                params={{ id: t.id }}
                className="tabular-nums font-semibold hover:underline"
                style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}
              >
                {t.id.slice(0, 8)}
              </Link>
              <div className="min-w-0">
                <p className="font-medium truncate" style={{ color: T.ink }}>
                  {t.sender?.name ?? "—"}
                </p>
                <p className="text-[10px] tabular-nums truncate" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {t.sender?.phone ?? ""}
                </p>
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate" style={{ color: T.ink }}>
                  {t.recipient?.name ?? "—"}
                </p>
                <p className="text-[10px] truncate" style={{ color: T.muted }}>
                  {t.recipient?.accountHint ?? t.recipient?.rail ?? ""}
                </p>
              </div>
              <span className="tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {fmtMoney(t.currency, t.amountMinor)}
              </span>
              <Pill tone={statusTone(t.status)}>{t.status}</Pill>
              <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {new Date(t.createdAt).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}
