import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, Search } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { downloadTransfersCsv, fetchAdminTransfers, fmtMoney, type AdminTransfer } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/transactions/")({
  head: () => ({ meta: [{ title: "Transactions — MagnetPay Admin" }] }),
  component: Page,
});

function statusTone(status: string): "success" | "warn" | "danger" | "info" | "neutral" {
  const s = status.toUpperCase();
  if (s === "COMPLETED" || s === "SUCCESS" || s === "SETTLED") return "success";
  if (s === "PENDING" || s === "PROCESSING") return "warn";
  if (s === "FAILED" || s === "REJECTED") return "danger";
  return "info";
}

function Page() {
  const [rows, setRows] = useState<AdminTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [query, setQuery] = useState("");

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
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchAdminTransfers();
        if (!cancelled) setRows(data);
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load transfers");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const n = query.toLowerCase();
    return rows.filter(
      (t) =>
        t.id.toLowerCase().includes(n) ||
        (t.sender?.name ?? "").toLowerCase().includes(n) ||
        (t.recipient?.name ?? "").toLowerCase().includes(n) ||
        t.status.toLowerCase().includes(n),
    );
  }, [rows, query]);

  return (
    <AdminShell
      title="Transactions"
      description="Transfers and monetary movements across the platform."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Money" }, { label: "Transactions" }]}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 h-9 px-3 rounded-lg w-[280px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <Search className="size-3.5" style={{ color: T.muted }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ID, sender, recipient…"
            className="bg-transparent text-[12px] outline-none flex-1"
            style={{ color: T.ink }}
          />
        </div>
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
      </div>

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
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No transfers yet.
          </p>
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
