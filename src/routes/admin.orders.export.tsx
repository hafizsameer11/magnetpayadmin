import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { downloadOrdersCsv, fetchAdminOrders, fmtMoney } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders/export")({
  head: () => ({ meta: [{ title: "Export orders — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const [rows, setRows] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    void fetchAdminOrders()
      .then(setRows)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  const onExport = async () => {
    setExporting(true);
    try {
      await downloadOrdersCsv();
      toast.success("Orders CSV downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const totalMinor = rows.reduce((sum, raw) => sum + Number((raw as Record<string, unknown>).totalMinor ?? 0), 0);

  return (
    <AdminShell
      title="Export orders"
      description="Download marketplace orders as CSV (up to 5,000 most recent)."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Orders", to: "/admin/orders" }, { label: "Export" }]}
      actions={
        <button
          type="button"
          onClick={() => void onExport()}
          disabled={exporting || loading}
          className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 disabled:opacity-60"
          style={{ background: T.navy, color: "#fff" }}
        >
          {exporting ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
          Download CSV
        </button>
      }
    >
      {loading ? (
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
              Orders loaded
            </p>
            <p className="mt-2 text-[22px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {rows.length}
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
              Total value (preview)
            </p>
            <p className="mt-2 text-[22px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.success }}>
              {fmtMoney("NGN", totalMinor)}
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
              Export limit
            </p>
            <p className="mt-2 text-[22px] font-bold">5,000 rows</p>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
